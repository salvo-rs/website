# Request

In Salvo, user request data can be obtained through [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Quick Overview
Request is a struct representing an HTTP request, providing comprehensive request handling capabilities:

* Operates on basic attributes (URI, method, version)
* Handles request headers and Cookies
* Parses various parameters (path, query, form)
* Supports request body processing and file uploads
* Offers multiple data parsing methods (JSON, form, etc.)
* Implements unified type-safe data extraction via the extract method

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Getting Query Parameters

Query parameters can be obtained via `get_query`:

```rust
req.query::<String>("id");
```

## Getting Form Data

Form data can be obtained via `get_form`. This function is asynchronous:

```rust
req.form::<String>("id").await;
```

## Getting JSON Deserialized Data

```rust
req.parse_json::<User>().await;
```

## Extracting Request Data

`Request` provides multiple methods to parse this data into strongly-typed structures.

* `parse_params`: Parses the request's router params into a specific data type.
* `parse_queries`: Parses the request's URL queries into a specific data type.
* `parse_headers`: Parses the request's HTTP headers into a specific data type.
* `parse_json`: Parses the data in the HTTP body part of the request as JSON format into a specific type.
* `parse_form`: Parses the data in the HTTP body part of the request as a Form into a specific type.
* `parse_body`: Parses the data in the HTTP body part into a specific type based on the request's `content-type`.
* `extract`: Can merge different data sources to parse out a specific type.

## Parsing Principle

Here, a custom `serde::Deserializer` is used to extract data from structures like `HashMap<String, String>` and `HashMap<String, Vec<String>>` into specific data types.

For example: `URL queries` are actually extracted as a [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) type. `MultiMap` can be thought of as a data structure similar to `HashMap<String, Vec<String>>`. If the requested URL is `http://localhost/users?id=123&id=234`, and our target type is:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Then the first `id=123` will be parsed, and `id=234` will be discarded:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

If our provided type is:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Then both `id=123&id=234` will be parsed:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Built-in Extractors
The framework includes built-in request parameter extractors. These extractors can significantly simplify code for handling HTTP requests.

:::tip
To use them, you need to add the `"oapi" feature` in your `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Then you can import the extractors:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Used to extract JSON data from the request body and deserialize it into a specified type.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Created user with ID {}", user.id)
}
```

#### FormBody
Extracts form data from the request body and deserializes it into a specified type.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Updated user with ID {}", user.id)
}
```

#### CookieParam
Extracts a specific value from the request's Cookies.

```rust
// The second parameter: if true, into_inner() will panic if the value doesn't exist.
// If false, into_inner() returns Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("User ID from Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extracts a specific value from the request headers.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("User ID from Header: {}", user_id.into_inner())
}
```

#### PathParam
Extracts parameters from the URL path.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("User ID from Path: {}", id.into_inner())
}
```

#### QueryParam
Extracts parameters from the URL query string.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Searching for user with ID: {}", id.into_inner())
}
```

### Advanced Usage
You can merge multiple data sources to parse a specific type. First, define a custom type, for example:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// By default, gets field values from the body.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// The id is obtained from the request path parameters and automatically parsed as i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Reference types can be used to avoid memory copying.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Then in a `Handler`, you can get the data like this:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

You can even pass the type directly as a function parameter, like this:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Data type definitions offer considerable flexibility, even allowing parsing into nested structures as needed:

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
    /// This nested field is parsed entirely from the Request again.
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

For a concrete example, see: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

If in the above example Nested<'a> does not have fields with the same names as the parent, you can use `#[serde(flatten)]`. Otherwise, you need to use `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

You can also add a `parse` parameter to `source` to specify a particular parsing method. If this parameter is not specified, parsing is determined based on the `Request` information. For a `Form` body, it's parsed as `MultiMap`; for a JSON payload, it's parsed as JSON. Generally, you don't need to specify this parameter. In rare cases, specifying it can enable special functionality.

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

For instance, here the actual request sends a Form, but the value of a certain field is a piece of JSON text. By specifying `parse`, this string can be parsed in JSON format.

## Partial API Overview. For the latest and most detailed information, please refer to the crates API documentation.
# Request Struct Method Overview

| Category | Method | Description |
|----------|--------|-------------|
| **Request Info** | `uri()/uri_mut()/set_uri()` | URI operations |
| | `method()/method_mut()` | HTTP method operations |
| | `version()/version_mut()` | HTTP version operations |
| | `scheme()/scheme_mut()` | Protocol scheme operations |
| | `remote_addr()/local_addr()` | Address information |
| **Request Headers** | `headers()/headers_mut()` | Get all request headers |
| | `header<T>()/try_header<T>()` | Get and parse a specific header |
| | `add_header()` | Add a request header |
| | `content_type()/accept()` | Get content type/accept type |
| **Parameter Handling** | `params()/param<T>()` | Path parameter operations |
| | `queries()/query<T>()` | Query parameter operations |
| | `form<T>()/form_or_query<T>()` | Form data operations |
| **Request Body** | `body()/body_mut()` | Get the request body |
| | `replace_body()/take_body()` | Modify/extract the request body |
| | `payload()/payload_with_max_size()` | Get raw data |
| **File Handling** | `file()/files()/all_files()` | Get uploaded files |
| | `first_file()` | Get the first file |
| **Data Parsing** | `extract<T>()` | Unified data extraction |
| | `parse_json<T>()/parse_form<T>()` | Parse JSON/form |
| | `parse_body<T>()` | Intelligently parse the request body |
| | `parse_params<T>()/parse_queries<T>()` | Parse parameters/queries |
| **Special Features** | `cookies()/cookie()` | Cookie operations (requires cookie feature) |
| | `extensions()/extensions_mut()` | Extension data storage |
| | `set_secure_max_size()` | Set secure size limit |