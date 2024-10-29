# Request

在 Salvo 中可以通過 [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) 獲取用戶請求的數據:

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## 獲取查詢參數

可以通過 `get_query` 獲取查詢參數:

```rust
req.query::<String>("id");
```

## 獲取 Form 數據

可以通過 `get_form` 獲取查詢參數, 此函數為異步函數:

```rust
req.form::<String>("id").await;
```


## 獲取 JSON 反序列化數據

```rust
req.parse_json::<User>().await;
```

## 提取 Request 數據


`Request` 提供多個方法將這些數據解析為強類型結構.

* `parse_params`: 將請求的 router params 解析為特定的數據類型;
* `parse_queries`: 將請求的 URL queries 解析為特定的數據類型;
* `parse_headers`: 將請求的 HTTP headers 解析為特定的數據類型;
* `parse_json`: 將請求的 HTTP body 部分的數據當作 JSON 格式解析到特定的類型;
* `parse_form`: 將請求的 HTTP body 部分的數據當作 Form 錶單解析到特定的類型;
* `parse_body`: 根據請求的 `content-type` 的類型, 將 HTTP body 部分的數據解析為特定類型. 
* `extract`: 可以合並不同的數據源解析出特定的類型.

## 解析原理

此處通過自定義的 `serde::Deserializer` 將類似 `HashMap<String, String>` 和 `HashMap<String, Vec<String>>` 的數據提取為特定的數據類型.

比如: `URL queries` 實際上被提取為一個 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 類型, `MultiMap` 可以認為就是一個類似 `HashMap<String, Vec<String>>` 的數據結構. 如果請求的 URL 是 `http://localhost/users?id=123&id=234`, 我們提供的目標類型是:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

則第一個 `id=123` 會被解析, `id=234` 則被丟棄:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

如果我們提供的類型是:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

則 `id=123&id=234` 都會被解析:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### 內置提取器
框架內置了請求參數提取器. 這些提取器可以大大簡化處理HTTP請求的代碼

#### Requirements

To use the extractors you need to add `"oapi" feature` in your `Cargo.toml`

```rust
salvo = {version = "*", features = ["oapi"]}
```

Then you can import the extractors

```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
用於從請求體中提取 JSON 數據並反序列化為指定類型. 

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("已創建ID為 {} 的用戶", user.id)
}
```
#### FormBody
從請求體中提取錶單數據並反序列化為指定類型. 

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("已更新ID為 {} 的用戶", user.id)
}
```
#### CookieParam
從請求的 Cookie 中提取特定的值. 

```rust
//第二個參數 為 true 時如果值不存在，into_inner() 會 panic, 為 false,
//into_inner() 方法返回 Option<T>. 
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("從Cookie中獲取的用戶ID: {}", user_id.into_inner())
}
```
#### HeaderParam

從請求頭中提取特定的值. 

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("從請求頭中獲取的用戶ID: {}", user_id.into_inner())
}
```
#### PathParam
從 URL 路徑中提取參數. 

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("從路徑中獲取的用戶ID: {}", id.into_inner())
}
```
#### QueryParam
從 URL 查詢字符串中提取參數. 

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("正在搜索ID為 {} 的用戶", id.into_inner())
}
```
### 高階用法 
可以合並多個數據源, 解析出特定類型, 可以先定義一個自定義的類型, 比如: 

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// 默認從 body 中獲取數據字段值
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// 其中, id 號從請求路徑參數中獲取, 並且自動解析數據為 i64 類型.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// 可以使用引用類型, 避免內存複製.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

然後在 `Handler` 中可以這樣獲取數據:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

甚至於可以直接把類型作為參數傳入函數, 像這樣:


```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

數據類型的定義有相當大的靈活性, 甚至可以根據需要解析為嵌套的結構:

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
    /// 這個 nested 字段完全是從 Request 重新解析.
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

具體實例參見: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

如果在上麵例子中 Nested<'a> 冇有與父級相同的字段，可以使用 `#[serde(flatten)]`, 否則需要使用 `·`#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

實際上還可以給 `source` 添加一個 `parse` 的參數指定特定的解析方式. 如果不指定這個參數，解析會根據 `Request` 的信息決定 `Body` 部分的解析方式，如果是 `Form` 錶單，則按照 `MuiltMap` 的方式解析，如果是 json 的 payload, 則按 json 格式解析. 一般情況下不需要指定這個參數, 極個別情況下, 指定這個參數可以實現一些特殊功能.

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

比如這裏實際請求發來的是 Form，但是某個字段的值是一段 json 的文本，這時候可以通過指定 `parse`，按 json 格式解析這個字符串. 