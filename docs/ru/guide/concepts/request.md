# Запрос

В Salvo данные пользовательского запроса можно получить через [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Краткий обзор
`Request` — это структура, представляющая HTTP-запрос, предоставляющая комплексные возможности обработки запросов:

* Работа с базовыми атрибутами (URI, метод, версия)
* Обработка заголовков запроса и Cookies
* Разбор различных параметров (путь, query, форма)
* Поддержка обработки тела запроса и загрузки файлов
* Предоставление нескольких методов разбора данных (JSON, форма и т.д.)
* Реализация единого типобезопасного извлечения данных через метод `extract`

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Получение параметров запроса (Query)

Параметры запроса можно получить через `get_query`:

```rust
req.query::<String>("id");
```

## Получение данных формы (Form)

Данные формы можно получить через `get_form`. Эта функция асинхронная:

```rust
req.form::<String>("id").await;
```

## Получение десериализованных JSON-данных

```rust
req.parse_json::<User>().await;
```

## Извлечение данных запроса

`Request` предоставляет несколько методов для разбора этих данных в строго типизированные структуры.

* `parse_params`: Разбирает параметры маршрутизатора запроса в конкретный тип данных.
* `parse_queries`: Разбирает URL-запросы запроса в конкретный тип данных.
* `parse_headers`: Разбирает HTTP-заголовки запроса в конкретный тип данных.
* `parse_json`: Разбирает данные в части HTTP-тела запроса в формате JSON в конкретный тип.
* `parse_form`: Разбирает данные в части HTTP-тела запроса в виде Формы в конкретный тип.
* `parse_body`: Разбирает данные в части HTTP-тела в конкретный тип на основе `content-type` запроса.
* `extract`: Может объединять различные источники данных для разбора конкретного типа.

## Принцип разбора

Здесь используется пользовательский `serde::Deserializer` для извлечения данных из структур, таких как `HashMap<String, String>` и `HashMap<String, Vec<String>>`, в конкретные типы данных.

Например: `URL queries` фактически извлекаются как тип [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` можно рассматривать как структуру данных, похожую на `HashMap<String, Vec<String>>`. Если запрашиваемый URL — `http://localhost/users?id=123&id=234`, а наш целевой тип:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Тогда будет разобран первый `id=123`, а `id=234` будет отброшен:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Если предоставленный нами тип:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Тогда оба `id=123&id=234` будут разобраны:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Встроенные экстракторы
Фреймворк включает встроенные экстракторы параметров запроса. Эти экстракторы могут значительно упростить код для обработки HTTP-запросов.

:::tip
Для их использования необходимо добавить фичу `"oapi"` в ваш `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Затем вы можете импортировать экстракторы:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Используется для извлечения JSON-данных из тела запроса и десериализации их в указанный тип.

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
    format!("Обновлен пользователь с ID {}", user.id)
}
```

#### CookieParam
Извлекает конкретное значение из Cookies запроса.

```rust
// Второй параметр: если true, into_inner() вызовет панику, если значение не существует.
// Если false, into_inner() возвращает Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID пользователя из Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Извлекает конкретное значение из заголовков запроса.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID пользователя из заголовка: {}", user_id.into_inner())
}
```

#### PathParam
Извлекает параметры из пути URL.

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
    format!("Поиск пользователя с ID: {}", id.into_inner())
}
```

### Продвинутое использование
Вы можете объединить несколько источников данных для разбора конкретного типа. Сначала определите пользовательский тип, например:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// По умолчанию получает значения полей из тела.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// id получается из параметров пути запроса и автоматически парсится как i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Можно использовать ссылочные типы, чтобы избежать копирования памяти.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Затем в `Handler` вы можете получить данные так:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Вы даже можете передать тип напрямую как параметр функции, вот так:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Определения типов данных предлагают значительную гибкость, даже позволяя при необходимости разбирать их во вложенные структуры:

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
    /// Это вложенное поле полностью парсится заново из Request.
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

Если в приведенном выше примере Nested<'a> не имеет полей с такими же именами, как у родителя, можно использовать `#[serde(flatten)]`. В противном случае нужно использовать `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Вы также можете добавить параметр `parse` к `source`, чтобы указать конкретный метод разбора. Если этот параметр не указан, разбор определяется на основе информации `Request`. Для тела `Form` он разбирается как `MultiMap`; для JSON-полезной нагрузки — как JSON. Обычно вам не нужно указывать этот параметр. В редких случаях его указание может включить специальную функциональность.

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

Например, здесь фактический запрос отправляет Form, но значение определенного поля — это фрагмент JSON-текста. Указав `parse`, эту строку можно разобрать в формате JSON.

## Частичный обзор API. Для получения самой актуальной и подробной информации обратитесь к документации API крейтов.
# Обзор методов структуры Request

| Категория | Метод | Описание |
|----------|--------|-------------|
| **Информация о запросе** | `uri()/uri_mut()/set_uri()` | Операции с URI |
| | `method()/method_mut()` | Операции с HTTP-методом |
| | `version()/version_mut()` | Операции с версией HTTP |
| | `scheme()/scheme_mut()` | Операции со схемой протокола |
| | `remote_addr()/local_addr()` | Информация об адресах |
| **Заголовки запроса** | `headers()/headers_mut()` | Получить все заголовки запроса |
| | `header<T>()/try_header<T>()` | Получить и разобрать конкретный заголовок |
| | `add_header()` | Добавить заголовок запроса |
| | `content_type()/accept()` | Получить тип содержимого/тип accept |
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
| | `extensions()/extensions_mut()` | Хранилище данных расширений |
| | `set_secure_max_size()` | Установить безопасный лимит размера |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}