# Request  

In Salvo, user request data can be obtained through the [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) struct:  

### Quick Overview  
`Request` is a struct representing HTTP requests, providing comprehensive request-handling capabilities:  

* Access to basic attributes (URI, method, version)  
* Handling of headers and cookies  
* Parsing of various parameters (path, query, form)  
* Support for request body processing and file uploads  
* Multiple data parsing methods (JSON, form, etc.)  
* Type-safe data extraction via the `extract` method  

```rust  
#[handler]  
async fn hello(req: &mut Request) -> String {  
    req.params().get("id").cloned().unwrap_or_default()  
}  
```  

## Retrieving Query Parameters  

Query parameters can be obtained using `get_query`:  

```rust  
req.query::<String>("id");  
```  

## Retrieving Form Data  

Form data can be retrieved using `get_form`, which is an asynchronous function:  

```rust  
req.form::<String>("id").await;  
```  

## Deserializing JSON Data  

```rust  
req.parse_json::<User>().await;  
```  

## Extracting Request Data  

`Request` provides multiple methods to parse data into strongly typed structures:  

* `parse_params`: Parses router params into a specific type.  
* `parse_queries`: Parses URL queries into a specific type.  
* `parse_headers`: Parses HTTP headers into a specific type.  
* `parse_json`: Parses the HTTP body as JSON into a specific type.  
* `parse_form`: Parses the HTTP body as form data into a specific type.  
* `parse_body`: Parses the HTTP body based on the `content-type` into a specific type.  
* `extract`: Combines different data sources to extract a specific type.  

## Parsing Mechanism  

A custom `serde::Deserializer` is used to extract data from structures like `HashMap<String, String>` and `HashMap<String, Vec<String>>` into specific types.  

For example, `URL queries` are extracted as a [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), which is similar to `HashMap<String, Vec<String>>`. If the requested URL is `http://localhost/users?id=123&id=234`, and the target type is:  

```rust  
#[derive(Deserialize)]  
struct User {  
  id: i64  
}  
```  

The first `id=123` will be parsed, while `id=234` is discarded:  

```rust  
let user: User = req.parse_queries().unwrap();  
assert_eq!(user.id, 123);  
```  

If the target type is:  

```rust  
#[derive(Deserialize)]  
struct Users {  
  ids: Vec<i64>  
}  
```  

Both `id=123` and `id=234` will be parsed:  

```rust  
let users: Users = req.parse_queries().unwrap();  
assert_eq!(user.ids, vec![123, 234]);  
```  

### Built-in Extractors  
The framework includes built-in request parameter extractors, which significantly simplify HTTP request handling.  

:::tip  
To use these extractors, enable the `"oapi"` feature in your `Cargo.toml`:  
```rust  
salvo = { version = "*", features = ["oapi"] }  
```  
:::  

Then import the extractors:  
```rust  
use salvo::{oapi::extract::JsonBody, prelude::*};  
```  

#### JsonBody  
Extracts JSON data from the request body and deserializes it into a specified type.  

```rust  
#[handler]  
async fn create_user(json: JsonBody<User>) -> String {  
    let user = json.into_inner();  
    format!("Created user with ID: {}", user.id)  
}  
```  

#### FormBody  
Extracts form data from the request body and deserializes it into a specified type.  

```rust  
#[handler]  
async fn update_user(form: FormBody<User>) -> String {  
    let user = form.into_inner();  
    format!("Updated user with ID: {}", user.id)  
}  
```  

#### CookieParam  
Extracts a specific value from request cookies.  

```rust  
// The second parameter determines behavior:  
// - If `true`, `into_inner()` panics if the value is missing.  
// - If `false`, `into_inner()` returns `Option<T>`.  
#[handler]  
fn get_user_from_cookie(user_id: CookieParam<i64, true>) -> String {  
    format!("User ID from cookie: {}", user_id.into_inner())  
}  
```  

#### HeaderParam  
Extracts a specific value from request headers.  

```rust  
#[handler]  
fn get_user_from_header(user_id: HeaderParam<i64, true>) -> String {  
    format!("User ID from header: {}", user_id.into_inner())  
}  
```  

#### PathParam  
Extracts parameters from the URL path.  

```rust  
#[handler]  
fn get_user(id: PathParam<i64>) -> String {  
    format!("User ID from path: {}", id.into_inner())  
}  
```  

#### QueryParam  
Extracts parameters from the URL query string.  

```rust  
#[handler]  
fn search_user(id: QueryParam<i64, true>) -> String {  
    format!("Searching for user with ID: {}", id.into_inner())  
}  
```  

### Advanced Usage  
Multiple data sources can be combined to extract a specific type. First, define a custom type:  

```rust  
#[derive(Serialize, Deserialize, Extractible, Debug)]  
/// By default, extracts field values from the request body.  
#[salvo(extract(default_source(from = "body"))]  
struct GoodMan<'a> {  
    /// The `id` field is extracted from path parameters and parsed as `i64`.  
    #[salvo(extract(source(from = "param"))]  
    id: i64,  
    /// Reference types can be used to avoid memory copying.  
    username: &'a str,  
    first_name: String,  
    last_name: String,  
}  
```  

Then, in a handler, extract the data as follows:  

```rust  
#[handler]  
async fn edit(req: &mut Request) {  
    let good_man: GoodMan<'_> = req.extract().await.unwrap();  
}  
```  

Alternatively, pass the type directly as a function parameter:  

```rust  
#[handler]  
async fn edit<'a>(good_man: GoodMan<'a>) {  
    res.render(Json(good_man));  
}  
```  

The data type definition is highly flexible, allowing for nested structures:  

```rust  
#[derive(Serialize, Deserialize, Extractible, Debug)]  
#[salvo(extract(default_source(from = "body"))]  
struct GoodMan<'a> {  
    #[salvo(extract(source(from = "param"))]  
    id: i64,  
    #[salvo(extract(source(from = "query"))]  
    username: &'a str,  
    first_name: String,  
    last_name: String,  
    lovers: Vec<String>,  
    /// The `nested` field is fully re-parsed from the request.  
    #[salvo(extract(flatten))]  
    nested: Nested<'a>,  
}  

#[derive(Serialize, Deserialize, Extractible, Debug)]  
#[salvo(extract(default_source(from = "body"))]  
struct Nested<'a> {  
    #[salvo(extract(source(from = "param"))]  
    id: i64,  
    #[salvo(extract(source(from = "query"))]  
    username: &'a str,  
    first_name: String,  
    last_name: String,  
    #[salvo(extract(rename = "lovers"))]  
    #[serde(default)]  
    pets: Vec<String>,  
}  
```  

For a practical example, see: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).  

### `#[salvo(extract(flatten))]` vs. `#[serde(flatten)]`  

If the nested struct `Nested<'a>` does not share fields with its parent, `#[serde(flatten)]` can be used. Otherwise, `#[salvo(extract(flatten))]` is required.  

### `#[salvo(extract(source(parse)))]`  

The `source` attribute can also include a `parse` parameter to specify a custom parsing method. If omitted, the parsing method is determined by the request's `content-type` (e.g., `Form` data is parsed as `MultiMap`, while JSON payloads are parsed as JSON). This parameter is rarely needed but can enable special functionality.  

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
        #[salvo(extract(source(from = "param"))]  
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

Here, the request sends form data, but one field contains JSON text. By specifying `parse = "json"`, the string is parsed as JSON.  

## Partial API Overview  
For the latest and most detailed information, refer to the [crates.io API documentation](https://docs.rs/salvo_core/latest/salvo_core/).  

# Request Struct Method Summary  

| Category          | Method                          | Description |  
|-------------------|---------------------------------|-------------|  
| **Request Info**  | `uri()/uri_mut()/set_uri()`    | URI operations |  
|                   | `method()/method_mut()`        | HTTP method operations |  
|                   | `version()/version_mut()`      | HTTP version operations |  
|                   | `scheme()/scheme_mut()`        | Protocol scheme operations |  
|                   | `remote_addr()/local_addr()`   | Address information |  
| **Headers**       | `headers()/headers_mut()`      | Retrieve all headers |  
|                   | `header<T>()/try_header<T>()`  | Retrieve and parse a specific header |  
|                   | `add_header()`                 | Add a header |  
|                   | `content_type()/accept()`      | Retrieve content type/accept headers |  
| **Parameters**    | `params()/param<T>()`          | Path parameter operations |  
|                   | `queries()/query<T>()`         | Query parameter operations |  
|                   | `form<T>()/form_or_query<T>()` | Form data operations |  
| **Request Body**  | `body()/body_mut()`            | Retrieve the request body |  
|                   | `replace_body()/take_body()`   | Modify/extract the request body |  
|                   | `payload()/payload_with_max_size()` | Retrieve raw data |  
| **File Handling** | `file()/files()/all_files()`   | Retrieve uploaded files |  
|                   | `first_file()`                 | Retrieve the first file |  
| **Data Parsing**  | `extract<T>()`                 | Unified data extraction |  
|                   | `parse_json<T>()/parse_form<T>()` | Parse JSON/form data |  
|                   | `parse_body<T>()`              | Smart request body parsing |  
|                   | `parse_params<T>()/parse_queries<T>()` | Parse parameters/queries |  
| **Special Features** | `cookies()/cookie()`        | Cookie operations (requires `cookie` feature) |  
|                   | `extensions()/extensions_mut()` | Extension data storage |  
|                   | `set_secure_max_size()`        | Set secure size limits |