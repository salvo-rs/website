# Запрос

В Salvo данные пользовательского запроса можно получить через структуру [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Быстрое понимание
Request — это структура, представляющая HTTP-запрос, предоставляющая полный набор функций для обработки запросов:

* Работа с базовыми атрибутами (URI, метод, версия)
* Обработка заголовков и Cookie
* Разбор различных параметров (путь, запрос, форма)
* Поддержка обработки тела запроса и загрузки файлов
* Предоставление различных методов разбора данных (JSON, формы и т.д.)
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

Данные формы можно получить через `get_form`, эта функция асинхронная:

```rust
req.form::<String>("id").await;
```

## Получение десериализованных JSON-данных

```rust
req.parse_json::<User>().await;
```

## Извлечение данных запроса

`Request` предоставляет несколько методов для разбора этих данных в строго типизированные структуры.

* `parse_params`: разбирает параметры маршрута запроса в указанный тип данных;
* `parse_queries`: разбирает параметры URL-запроса в указанный тип данных;
* `parse_headers`: разбирает HTTP-заголовки запроса в указанный тип данных;
* `parse_json`: разбирает данные тела HTTP-запроса как JSON в указанный тип;
* `parse_form`: разбирает данные тела HTTP-запроса как форму в указанный тип;
* `parse_body`: в зависимости от `content-type` запроса, разбирает данные тела HTTP-запроса в указанный тип;
* `extract`: может объединять различные источники данных для разбора в указанный тип.

## Принцип разбора

Здесь используется пользовательский `serde::Deserializer` для извлечения данных из структур типа `HashMap<String, String>` и `HashMap<String, Vec<String>>` в указанные типы данных.

Например: `URL queries` фактически извлекаются как тип [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), который можно рассматривать как структуру данных, аналогичную `HashMap<String, Vec<String>>`. Если запрошенный URL — `http://localhost/users?id=123&id=234`, а целевой тип:

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

Если же указан тип:

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
Для использования необходимо добавить экстрактор `"oapi" feature` в ваш `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Затем можно импортировать экстракторы:
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
Извлекает данные формы из тела запроса и десериализует в указанный тип.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Обновлен пользователь с ID {}", user.id)
}
```

#### CookieParam
Извлекает определенное значение из Cookie запроса.

```rust
//Второй параметр — если true, при отсутствии значения into_inner() вызовет panic, если false,
//метод into_inner() вернет Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID пользователя из Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam

Извлекает определенное значение из заголовка запроса.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID пользователя из заголовка: {}", user_id.into_inner())
}
```

#### PathParam
Извлекает параметр из пути URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID пользователя из пути: {}", id.into_inner())
}
```

#### QueryParam
Извлекает параметр из строки запроса URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Поиск пользователя с ID {}", id.into_inner())
}
```

### Продвинутое использование
Можно объединять несколько источников данных для разбора в определенный тип. Сначала определите пользовательский тип, например:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// По умолчанию значения полей берутся из тела
#[salvo(extract(default_source(from = "body"))]
struct GoodMan<'a> {
    /// При этом id берется из параметров пути запроса и автоматически разбирается как i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Можно использовать ссылочные типы, чтобы избежать копирования памяти.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Затем в `Handler` можно получить данные так:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Или даже напрямую передать тип как параметр функции:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Определение типов данных обладает значительной гибкостью, позволяя разбирать даже вложенные структуры:

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
#[salvo(extract(default_source(from = "body"))]
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

Если в приведенном примере Nested<'a> не имеет полей, совпадающих с родительскими, можно использовать `#[serde(flatten)]`, в противном случае необходимо использовать `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Фактически, можно также добавить параметр `parse` к `source` для указания конкретного способа разбора. Если этот параметр не указан, разбор будет выполняться на основе информации из `Request`: для формы Form — как MuiltMap, для JSON-полезной нагрузки — как JSON. Обычно этот параметр указывать не нужно, но в редких случаях он может реализовать специальные функции.

```rust
#[tokio::test]
async fn test_de_request_with_form_json_str() {
    #[derive(Deserialize, Eq, PartialEq, Debug)]
    struct User<'a> {
        name: &'a str,
        age: usize,
    }
    #[derive(Deserialize, Extractible, Eq, PartialEq, Debug)]
    #[salvo(extract(default_source(from = "body", parse = "json"))]
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

Например, если фактически запрос отправляет Form, но значение некоторого поля — это текст в формате JSON, можно указать `parse`, чтобы разобрать эту строку как JSON.

## Краткий обзор API, самые свежие и подробные сведения см. в документации creates API
# Обзор методов структуры Request

| Категория | Метод | Описание |
|-----------|-------|----------|
| **Информация о запросе** | `uri()/uri_mut()/set_uri()` | Операции с URI |
| | `method()/method_mut()` | Операции с HTTP-методом |
| | `version()/version_mut()` | Операции с версией HTTP |
| | `scheme()/scheme_mut()` | Операции с протоколом |
| | `remote_addr()/local_addr()` | Информация об адресе |
| **Заголовки запроса** | `headers()/headers_mut()` | Получение всех заголовков |
| | `header<T>()/try_header<T>()` | Получение и разбор конкретного заголовка |
| | `add_header()` | Добавление заголовка |
| | `content_type()/accept()` | Получение типа контента/принимаемого типа |
| **Обработка параметров** | `params()/param<T>()` | Операции с параметрами пути |
| | `queries()/query<T>()` | Операции с параметрами запроса |
| | `form<T>()/form_or_query<T>()` | Операции с данными формы |
| **Тело запроса** | `body()/body_mut()` | Получение тела запроса |
| | `replace_body()/take_body()` | Изменение/извлечение тела запроса |
| | `payload()/payload_with_max_size()` | Получение сырых данных |
| **Обработка файлов** | `file()/files()/all_files()` | Получение загруженных файлов |
| | `first_file()` | Получение первого файла |
| **Разбор данных** | `extract<T>()` | Единое извлечение данных |
| | `parse_json<T>()/parse_form<T>()` | Разбор JSON/формы |
| | `parse_body<T>()` | Интеллектуальный разбор тела запроса |
| | `parse_params<T>()/parse_queries<T>()` | Разбор параметров/запроса |
| **Специальные функции** | `cookies()/cookie()` | Операции с Cookie (требуется cookie feature) |
| | `extensions()/extensions_mut()` | Хранение расширенных данных |
| | `set_secure_max_size()` | Установка ограничения безопасного размера |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}