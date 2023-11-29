# Request

在 Salvo 中可以通過 ```Request``` 獲取用戶請求的數據:

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## 獲取查詢參數

可以通過 ```get_query``` 獲取查詢參數:

```rust
req.query::<String>("id");
```

## 獲取 Form 數據

可以通過 ```get_form``` 獲取查詢參數, 此函數爲異步函數:

```rust
req.form::<String>("id").await;
```


## 獲取 JSON 反序列化數據

```rust
req.parse_json::<User>().await;
```

## 提取 Request 數據


```Request``` 提供多個方法將這些數據解析爲強類型結構.

* ```parse_params```: 將請求的 router params 解析爲特定的數據類型;
* ```parse_queries```: 將請求的 URL queries 解析爲特定的數據類型;
* ```parse_headers```: 將請求的 HTTP headers 解析爲特定的數據類型;
* ```parse_json```: 將請求的 HTTP body 部分的數據當作 JSON 格式解析到特定的類型;
* ```parse_form```: 將請求的 HTTP body 部分的數據當作 Form 表單解析到特定的類型;
* ```parse_body```: 根據請求的 ```content-type``` 的類型, 將 HTTP body 部分的數據解析爲特定類型. 
* ```extract```: 可以合併不同的數據源解析出特定的類型.

## 解析原理

此處通過自定義的 ```serde::Deserializer``` 將類似 ```HashMap<String, String>``` 和 ```HashMap<String, Vec<String>>``` 的數據提取爲特定的數據類型.

比如: ```URL queries``` 實際上被提取爲一個 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 類型, ```MultiMap``` 可以認爲就是一個類似 ```HashMap<String, Vec<String>>``` 的數據結構. 如果請求的 URL 是 ```http://localhost/users?id=123&id=234```, 我們提供的目標類型是:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

則第一個 ```id=123``` 會被解析, ```id=234``` 則被丟棄:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

如果我們提供的類型是:

```rust
#[derive(Deserialize)]
struct Users {
  id: Vec<i64>
}
```

則 ```id=123&id=234``` 都會被解析:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

可以合併多個數據源, 解析出特定類型, 可以先定義一個自定義的類型, 比如: 

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// 默認從 body 中獲取數據字段值
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// 其中, id 號從請求路徑參數中獲取, 並且自動解析數據爲 i64 類型.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// 可以使用引用類型, 避免內存複製.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

然後在 ```Handler``` 中可以這樣獲取數據:

```rust
#[handler]
async fn edit(req: &mut Request) -> String {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

甚至於可以直接把類型作爲參數傳入函數, 像這樣:


```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) -> String {
    res.render(Json(good_man));
}
```

數據類型的定義有相當大的靈活性, 甚至可以根據需要解析爲嵌套的結構:

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

如果在上面例子中 Nested<'a> 沒有與父級相同的字段，可以使用 `#[serde(flatten)]`, 否則需要使用 `·`#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

實際上還可以給 `source` 添加一個 `parse` 的參數指定特定的解析方式. 如果不指定這個參數，解析會根據 `Request` 的信息決定 `Body` 部分的解析方式，如果是 `Form` 表單，則按照 `MuiltMap` 的方式解析，如果是 json 的 payload, 則按 json 格式解析. 一般情況下不需要指定這個參數, 極個別情況下, 指定這個參數可以實現一些特殊功能.

```rust
#[tokio::test]
async fn test_de_request_with_form_json_str() {
    #[derive(Deserialize, Eq, PartialEq, Debug)]
    struct User<'a> {
        name: &'a str,
        age: usize,
    }
    #[derive(Deserialize, Extractible, Eq, PartialEq, Debug)]
    #[salvo(extract(default_source(from = "body", parser = "json")))]
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

比如這裏實際請求發來的是 Form，但是某個字段的值是一段 json 的文本，這時候可以通過指定 `parse`，按 json 格式解析這個字符串。