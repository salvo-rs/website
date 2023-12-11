# Request

For web applications it’s crucial to react to the data a client sends to the server. In Salvo this information is provided by the request:

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## About query string

We can get query string from request object:

```rust
req.query::<String>("id");
```

## About form


```rust
req.form::<String>("id").await;
```


## About json payload

```rust
req.parse_json::<User>().await;
```

## Extract Data

Request can be parsed into strongly typed structures by providing several functions through ```Request```.

* ```parse_params```: parse the requested router params into a specific data type;
* ```parse_queries```: parse the requested URL queries into a specific data type;
* ```parse_headers```: parse the requested HTTP haders into a specific data type;
* ```parse_json```: Parse the data in the HTTP body part of the request as JSON format to a specific type;
* ```parse_form```: Parse the data in the HTTP body part of the request as a Form form to a specific type;
* ```parse_body```: Parse the data in the HTTP body section to a specific type according to the type of the requested ```content-type```.
* ```extract```: can combine different data sources to parse a specific type.

## Parsing principle

The customized ```serde::Deserializer``` will be extract data similar to ```HashMap<String, String>``` and ```HashMap<String, Vec<String>>``` into a specific data type.

For example: ```URL queries``` is actually extracted as a [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) type, ```MultiMap``` can think of it as a data structure like ```HashMap<String, Vec<String>>```. If the requested URL is ```http://localhost/users?id=123&id=234```, we provide The target type is:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Then the first ```id=123``` will be parsed, and ```id=234``` will be discarded:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

If the type we provide is:

```rust
#[derive(Deserialize)]
struct Users {
  id: Vec<i64>
}
```

Then ```id=123&id=234``` will be parsed:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

Multiple data sources can be merged to parse out a specific type. You can define a custom type first, for example:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Get the data field value from the body by default.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// The id number is obtained from the request path parameter, and the data is automatically parsed as i64 type.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Reference types can be used to avoid memory copying.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Then in `Handler` you can get the data like this:

```rust
#[handler]
async fn edit(req: &mut Request) -> String {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

You can even pass the type directly to the function as a parameter, like this:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) -> String {
    res.render(Json(good_man));
}
```

There is considerable flexibility in the definition of data types, and can even be resolved into nested structures as needed:

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
    /// The nested field is completely reparsed from Request.
    #[salvo(extract(source(from = "request")))]
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

For specific examples, see: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

If in the above example Nested<'a> does not have the same fields as the parent, you can use `#[serde(flatten)]`, otherwise you need to use `·`#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

In fact, you can also add a `parse` parameter to `source` to specify a specific parsing method. If you do not specify this parameter, the parsing will determine the parsing method of the `Body` part based on the `Request` information. If it is a `Form` form , it will be parsed according to the `MuiltMap` method. If it is a json payload, it will be parsed according to the json format. Generally, there is no need to specify this parameter. In rare cases, specifying this parameter can achieve some special functions.

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

For example, the actual request here is Form, but the value of a certain field is a json text. At this time, you can specify `parse` to parse the string in json format.
