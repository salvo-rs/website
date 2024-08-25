# Request

在 Salvo 中可以通过 [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) 获取用户请求的数据:

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## 获取查询参数

可以通过 `get_query` 获取查询参数:

```rust
req.query::<String>("id");
```

## 获取 Form 数据

可以通过 `get_form` 获取查询参数, 此函数为异步函数:

```rust
req.form::<String>("id").await;
```


## 获取 JSON 反序列化数据

```rust
req.parse_json::<User>().await;
```

## 提取 Request 数据


`Request` 提供多个方法将这些数据解析为强类型结构.

* `parse_params`: 将请求的 router params 解析为特定的数据类型;
* `parse_queries`: 将请求的 URL queries 解析为特定的数据类型;
* `parse_headers`: 将请求的 HTTP headers 解析为特定的数据类型;
* `parse_json`: 将请求的 HTTP body 部分的数据当作 JSON 格式解析到特定的类型;
* `parse_form`: 将请求的 HTTP body 部分的数据当作 Form 表单解析到特定的类型;
* `parse_body`: 根据请求的 `content-type` 的类型, 将 HTTP body 部分的数据解析为特定类型. 
* `extract`: 可以合并不同的数据源解析出特定的类型.

## 解析原理

此处通过自定义的 `serde::Deserializer` 将类似 `HashMap<String, String>` 和 `HashMap<String, Vec<String>>` 的数据提取为特定的数据类型.

比如: `URL queries` 实际上被提取为一个 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 类型, `MultiMap` 可以认为就是一个类似 `HashMap<String, Vec<String>>` 的数据结构. 如果请求的 URL 是 `http://localhost/users?id=123&id=234`, 我们提供的目标类型是:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

则第一个 `id=123` 会被解析, `id=234` 则被丢弃:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

如果我们提供的类型是:

```rust
#[derive(Deserialize)]
struct Users {
  id: Vec<i64>
}
```

则 `id=123&id=234` 都会被解析:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### 内置提取器
框架内置了请求参数提取器. 这些提取器可以大大简化处理HTTP请求的代码

#### JsonBody
用于从请求体中提取 JSON 数据并反序列化为指定类型. 

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("已创建ID为 {} 的用户", user.id)
}
```
#### FormBody
从请求体中提取表单数据并反序列化为指定类型. 

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("已更新ID为 {} 的用户", user.id)
}
```
#### CookieParam
从请求的 Cookie 中提取特定的值. 

```rust
//第二个参数 为 true 时如果值不存在，into_inner() 会 panic, 为 false,
//into_inner() 方法返回 Option<T>. 
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("从Cookie中获取的用户ID: {}", user_id.into_inner())
}
```
#### HeaderParam

从请求头中提取特定的值. 

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("从请求头中获取的用户ID: {}", user_id.into_inner())
}
```
#### PathParam
从 URL 路径中提取参数. 

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("从路径中获取的用户ID: {}", id.into_inner())
}
```
#### QueryParam
从 URL 查询字符串中提取参数. 

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("正在搜索ID为 {} 的用户", id.into_inner())
}
```
### 高阶用法 
可以合并多个数据源, 解析出特定类型, 可以先定义一个自定义的类型, 比如: 

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// 默认从 body 中获取数据字段值
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// 其中, id 号从请求路径参数中获取, 并且自动解析数据为 i64 类型.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// 可以使用引用类型, 避免内存复制.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

然后在 `Handler` 中可以这样获取数据:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

甚至于可以直接把类型作为参数传入函数, 像这样:


```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

数据类型的定义有相当大的灵活性, 甚至可以根据需要解析为嵌套的结构:

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
    /// 这个 nested 字段完全是从 Request 重新解析.
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

具体实例参见: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

如果在上面例子中 Nested<'a> 没有与父级相同的字段，可以使用 `#[serde(flatten)]`, 否则需要使用 `·`#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

实际上还可以给 `source` 添加一个 `parse` 的参数指定特定的解析方式. 如果不指定这个参数，解析会根据 `Request` 的信息决定 `Body` 部分的解析方式，如果是 `Form` 表单，则按照 `MuiltMap` 的方式解析，如果是 json 的 payload, 则按 json 格式解析. 一般情况下不需要指定这个参数, 极个别情况下, 指定这个参数可以实现一些特殊功能.

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

比如这里实际请求发来的是 Form，但是某个字段的值是一段 json 的文本，这时候可以通过指定 `parse`，按 json 格式解析这个字符串. 