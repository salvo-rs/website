# Запрос

В Salvo данные пользовательского запроса можно получить через [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Быстрое понимание
Request — это структура, представляющая HTTP-запрос, которая предоставляет комплексные возможности для обработки запросов:

* Управление базовыми атрибутами (URI, метод, версия)
* Обработка заголовков и Cookie
* Разбор различных параметров (путь, запрос, форма)
* Поддержка обработки тела запроса и загрузки файлов
* Предоставление различных методов разбора данных (JSON, форма и т.д.)
* Единый типобезопасный извлечение данных через метод extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Получение параметров запроса

Параметры запроса можно получить через `get_query`:

```rust
req.query::<String>("id");
```

## Получение данных формы

Данные формы можно получить через `get_form`. Эта функция асинхронная:

```rust
req.form::<String>("id").await;
```

## Получение десериализованных JSON-данных

```rust
req.parse_json::<User>().await;
```

## Извлечение данных из Request

`Request` предоставляет несколько методов для разбора этих данных в строго типизированные структуры.

* `parse_params`: разбирает параметры маршрутизатора запроса в определённый тип данных;
* `parse_queries`: разбирает URL-запросы запроса в определённый тип данных;
* `parse_headers`: разбирает HTTP-заголовки запроса в определённый тип данных;
* `parse_json`: разбирает данные из части HTTP-тела запроса как JSON в определённый тип;
* `parse_form`: разбирает данные из части HTTP-тела запроса как форму в определённый тип;
* `parse_body`: разбирает данные из части HTTP-тела запроса в определённый тип в зависимости от `content-type` запроса.
* `extract`: может объединять различные источники данных для разбора в определённый тип.

## Принцип разбора

Здесь с помощью пользовательского `serde::Deserializer` данные, подобные `HashMap<String, String>` и `HashMap<String, Vec<String>>`, извлекаются в определённый тип данных.

Например: `URL queries` фактически извлекаются как тип [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` можно рассматривать как структуру данных, подобную `HashMap<String, Vec<String>>`. Если URL запроса — `http://localhost/users?id=123&id=234`, а наш целевой тип:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

то первый `id=123` будет разобран, а `id=234` — отброшен:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Если наш тип:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

то оба `id=123&id=234` будут разобраны:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Встроенные экстракторы
Фреймворк включает встроенные экстракторы параметров запроса. Эти экстракторы могут значительно упростить код обработки HTTP-запросов.

:::tip
Для использования вам необходимо добавить фичу `"oapi"` в ваш `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Затем вы можете импортировать экстракторы:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Используется для извлечения JSON-данных из тела запроса и десериализации в указанный тип.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Создан пользователь с ID {}", user.id)
}
```

#### FormBody
Извлекает данные формы из тела запроса и десериализует их в указанный тип.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Обновлён пользователь с ID {}", user.id)
}
```

#### CookieParam
Извлекает определённое значение из Cookie запроса.

```rust
// Второй параметр: если true, то при отсутствии значения into_inner() вызовет panic.
// Если false, метод into_inner() возвращает Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID пользователя из Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Извлекает определённое значение из заголовков запроса.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID пользователя из заголовка: {}", user_id.into_inner())
}
```

#### PathParam
Извлекает параметры из URL-пути.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID пользователя из пути: {}", id.into_inner())
}
```

#### QueryParam
Извлекает параметры из строки запроса URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Поиск пользователя с ID {}", id.into_inner())
}
```

### Продвинутое использование
Можно объединить несколько источников данных, чтобы разобрать определённый тип. Сначала можно определить пользовательский тип, например:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// По умолчанию значения полей данных получаются из body
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Здесь id получается из параметров пути запроса и автоматически разбирается как i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Можно использовать ссылочные типы, чтобы избежать копирования памяти.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Затем в `Handler` данные можно получить так:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Или даже напрямую передать тип как параметр в функцию, вот так:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Определение типа данных обладает значительной гибкостью, можно даже разбирать вложенные структуры по необходимости:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    #[salvo(extract(source(from = "param")))]
    id: i64,
    #[salvo(extract(source(from = "query")))]
    username: &'a str,
    first_name: String,
    last_name: String,
    lovers: Vec<String>,
    /// Это поле nested полностью разбирается заново из Request.
    #[salvo(extract(flatten))]
    nested: Nested<'a>,
}

#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct Nested<'a> {
    #[salvo(extract(source(from = "param")))]
    id: i64,
    #[salvo(extract(source(from = "query")))]
    username: &'a str,
    first_name: String,
    last_name: String,
    #[salvo(extract(rename = "lovers"))]
    #[serde(default)]
    pets: Vec<String>,
}
```

Конкретный пример см.: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Если в приведённом выше примере Nested<'a> не имеет полей, совпадающих с родительскими, можно использовать `#[serde(flatten)]`, иначе нужно использовать `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Фактически, для `source` также можно добавить параметр `parse`, указывающий конкретный способ разбора. Если этот параметр не указан, разбор будет определяться информацией из `Request`: если это форма Form, то разбор будет как `MuiltMap`, если это json payload, то как json. Обычно этот параметр указывать не нужно, в исключительных случаях его указание может реализовать некоторые специальные функции.

```rust
#[tokio::test]
async fn test_de_request_with_form_json_str() {
    #[derive(Deserialize, Eq, PartialEq, Debug)]
    struct User<'a> {
        name: &'a str,
        age: usize,
    }
    #[derive(Deserialize, Extractible, Eq, PartialEq, Debug)]
    #[salvo(extract(default_source(from = "body", parse = "json")))]
    struct RequestData<'a> {
        #[salvo(extract(source(from = "param")))]
        p2: &'a str,
        user: User<'a>,
    }
    let mut req = TestClient::get("http://127.0.0.1:5800/test/1234/param2v")
        .raw_form(r#"user={"name": "chris", "age": 20}"#)
        .build();
    req.params.insert("p2".into(), "921".into());
    let data: RequestData = req.extract().await.unwrap();
    assert_eq!(
        data,
        RequestData {
            p2: "921",
            user: User { name: "chris", age: 20 }
        }
    );
}
```

Например, здесь фактически отправлен запрос Form, но значение некоторого поля — это текст в формате json. В этом случае можно указать `parse` для разбора этой строки в формате json.

## Краткий обзор части API. Самую свежую и подробную информацию смотрите в документации к крейту.
# Обзор методов структуры Request

| Категория | Метод | Описание |
|------|------|------|
| **Информация о запросе** | `uri()/uri_mut()/set_uri()` | Операции с URI |
| | `method()/method_mut()` | Операции с HTTP-методом |
| | `version()/version_mut()` | Операции с версией HTTP |
| | `scheme()/scheme_mut()` | Операции со схемой протокола |
| | `remote_addr()/local_addr()` | Информация об адресах |
| **Заголовки запроса** | `headers()/headers_mut()` | Получить все заголовки запроса |
| | `header<T>()/try_header<T>()` | Получить и разобрать определённый заголовок |
| | `add_header()` | Добавить заголовок запроса |
| | `content_type()/accept()` | Получить тип контента/принимаемые типы |
| **Обработка параметров** | `params()/param<T>()` | Операции с параметрами пути |
| | `queries()/query<T>()` | Операции с параметрами запроса |
| | `form<T>()/form_or_query<T>()` | Операции с данными формы |
| **Тело запроса** | `body()/body_mut()` | Получить тело запроса |
| | `replace_body()/take_body()` | Изменить/извлечь тело запроса |
| | `payload()/payload_with_max_size()` | Получить сырые данные |
| **Обработка файлов** | `file()/files()/all_files()` | Получить загруженные файлы |
| | `first_file()` | Получить первый файл |
| **Разбор данных** | `extract<T>()` | Единое извлечение данных |
| | `parse_json<T>()/parse_form<T>()` | Разбор JSON/формы |
| | `parse_body<T>()` | Интеллектуальный разбор тела запроса |
| | `parse_params<T>()/parse_queries<T>()` | Разбор параметров/запросов |
| **Специальные возможности** | `cookies()/cookie()` | Операции с Cookie (требуется фича cookie) |
| | `extensions()/extensions_mut()` | Хранение расширенных данных |
| | `set_secure_max_size()` | Установить ограничение безопасного размера |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}