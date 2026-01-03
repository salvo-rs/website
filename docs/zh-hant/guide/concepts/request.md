# Request

在 Salvo 中，可以透過 [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) 來取得使用者請求的資料：

### 快速理解
Request 是一個代表 HTTP 請求的結構體，提供了完整的請求處理功能：

* 可操作基本屬性（URI、方法、版本）
* 處理請求標頭與 Cookie
* 解析各類參數（路徑、查詢、表單）
* 支援請求主體處理與檔案上傳
* 提供多種資料解析方法（JSON、表單等）
* 透過 extract 方法實現統一的型別安全資料提取

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## 取得查詢參數

可以透過 `get_query` 取得查詢參數：

```rust
req.query::<String>("id");
```

## 取得表單資料

可以透過 `get_form` 取得查詢參數，此函式為非同步函式：

```rust
req.form::<String>("id").await;
```

## 取得 JSON 反序列化資料

```rust
req.parse_json::<User>().await;
```

## 提取 Request 資料

`Request` 提供了多個方法，可將這些資料解析為強型別結構。

* `parse_params`：將請求的路由參數解析為特定資料型別；
* `parse_queries`：將請求的 URL 查詢參數解析為特定資料型別；
* `parse_headers`：將請求的 HTTP 標頭解析為特定資料型別；
* `parse_json`：將請求的 HTTP 主體部分資料視為 JSON 格式解析為特定型別；
* `parse_form`：將請求的 HTTP 主體部分資料視為表單解析為特定型別；
* `parse_body`：根據請求的 `content-type` 類型，將 HTTP 主體部分資料解析為特定型別。
* `extract`：可以合併不同的資料來源解析出特定型別。

## 解析原理

此處透過自訂的 `serde::Deserializer`，將類似 `HashMap<String, String>` 和 `HashMap<String, Vec<String>>` 的資料提取為特定資料型別。

例如：`URL queries` 實際上被提取為一個 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 型別，`MultiMap` 可視為類似 `HashMap<String, Vec<String>>` 的資料結構。如果請求的 URL 是 `http://localhost/users?id=123&id=234`，我們提供的目標型別是：

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

則第一個 `id=123` 會被解析，`id=234` 則會被捨棄：

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

如果我們提供的型別是：

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

則 `id=123&id=234` 都會被解析：

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### 內建提取器
框架內建了請求參數提取器。這些提取器可以大幅簡化處理 HTTP 請求的程式碼。

:::tip
若要使用您需要新增的提取器 `"oapi" feature`，請在您的 `Cargo.toml` 中新增：
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

然後您就可以匯入提取器了：
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
用於從請求主體中提取 JSON 資料並反序列化為指定型別。

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("已建立 ID 為 {} 的使用者", user.id)
}
```

#### FormBody
從請求主體中提取表單資料並反序列化為指定型別。

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("已更新 ID 為 {} 的使用者", user.id)
}
```

#### CookieParam
從請求的 Cookie 中提取特定的值。

```rust
// 第二個參數為 true 時，如果值不存在，into_inner() 會 panic；為 false 時，
// into_inner() 方法會回傳 Option<T>。
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("從 Cookie 中取得的使用者 ID：{}", user_id.into_inner())
}
```

#### HeaderParam
從請求標頭中提取特定的值。

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("從請求標頭中取得的使用者 ID：{}", user_id.into_inner())
}
```

#### PathParam
從 URL 路徑中提取參數。

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("從路徑中取得的使用者 ID：{}", id.into_inner())
}
```

#### QueryParam
從 URL 查詢字串中提取參數。

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("正在搜尋 ID 為 {} 的使用者", id.into_inner())
}
```

### 進階用法
可以合併多個資料來源，解析出特定型別。可以先定義一個自訂的型別，例如：

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// 預設從 body 中取得資料欄位值
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// 其中，id 號從請求路徑參數中取得，並且自動解析資料為 i64 型別。
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// 可以使用參考型別，避免記憶體複製。
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

然後在 `Handler` 中可以這樣取得資料：

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

甚至可以直接將型別作為參數傳入函式，像這樣：

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

資料型別的定義具有相當大的彈性，甚至可以根據需要解析為巢狀結構：

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
    /// 這個 nested 欄位完全是從 Request 重新解析。
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

具體範例請參閱：[extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs)。

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

如果在上面的例子中，Nested<'a> 沒有與父層相同的欄位，可以使用 `#[serde(flatten)]`，否則需要使用 `#[salvo(extract(flatten))]`。

### `#[salvo(extract(source(parse)))]`

實際上還可以給 `source` 新增一個 `parse` 參數，指定特定的解析方式。如果不指定這個參數，解析會根據 `Request` 的資訊決定 `Body` 部分的解析方式：如果是表單，則按照 `MuiltMap` 的方式解析；如果是 JSON 的 payload，則按 JSON 格式解析。一般情況下不需要指定這個參數，極少數情況下，指定這個參數可以實現一些特殊功能。

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
    let mut req = TestClient::get("http://127.0.0.1:8698/test/1234/param2v")
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

例如，這裡實際請求傳來的是表單，但某個欄位的值是一段 JSON 文字，這時可以透過指定 `parse`，按 JSON 格式解析這個字串。

## 部分 API 一覽，最新最詳細的資訊請參閱 crates API 文件
# Request 結構體方法概覽

| 類別 | 方法 | 描述 |
|------|------|------|
| **請求資訊** | `uri()/uri_mut()/set_uri()` | URI 操作 |
| | `method()/method_mut()` | HTTP 方法操作 |
| | `version()/version_mut()` | HTTP 版本操作 |
| | `scheme()/scheme_mut()` | 通訊協定方案操作 |
| | `remote_addr()/local_addr()` | 地址資訊 |
| **請求標頭** | `headers()/headers_mut()` | 取得全部請求標頭 |
| | `header<T>()/try_header<T>()` | 取得並解析特定標頭 |
| | `add_header()` | 新增請求標頭 |
| | `content_type()/accept()` | 取得內容類型/接受類型 |
| **參數處理** | `params()/param<T>()` | 路徑參數操作 |
| | `queries()/query<T>()` | 查詢參數操作 |
| | `form<T>()/form_or_query<T>()` | 表單資料操作 |
| **請求主體** | `body()/body_mut()` | 取得請求主體 |
| | `replace_body()/take_body()` | 修改/提取請求主體 |
| | `payload()/payload_with_max_size()` | 取得原始資料 |
| **檔案處理** | `file()/files()/all_files()` | 取得上傳檔案 |
| | `first_file()` | 取得第一個檔案 |
| **資料解析** | `extract<T>()` | 統一資料提取 |
| | `parse_json<T>()/parse_form<T>()` | 解析 JSON/表單 |
| | `parse_body<T>()` | 智慧解析請求主體 |
| | `parse_params<T>()/parse_queries<T>()` | 解析參數/查詢 |
| **特殊功能** | `cookies()/cookie()` | Cookie 操作（需 cookie feature） |
| | `extensions()/extensions_mut()` | 擴充資料儲存 |
| | `set_secure_max_size()` | 設定安全大小限制 |
{/* Auto generated, origin file hash:6b654f79df08ba1dc5cc1c070780def0 */}