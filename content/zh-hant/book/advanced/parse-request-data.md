---
title: "解析 Request 數據"
weight: 2101
menu:
  book:
    parent: "advanced"
---

### 解析的數據源

一個請求中的數據包含以下幾個部分:

* ```router params```: 指路由路徑匹配中的得到的參數列表。 比如： ```Router::with_path("/users/<id>/")``` 中的 ```id```.
* ```URL queries```: 從 URL 的查詢字符串中解析道的參數列表. 比如 ```http://localhost/user_id=123``` 中的 ```123```.
* ```HTTP headers```: 請求頭部的參數列表.
* ```Form```: 以 ```POST``` 形式提交的參數列表.

可以通過 ```Request``` 提供多個方法將這些數據解析為強類型結構.

* ```parse_params```: 將請求的 router params 解析為特定的數據類型;
* ```parse_queries```: 將請求的 URL queries 解析為特定的數據類型;
* ```parse_headers```: 將請求的 HTTP headers 解析為特定的數據類型;
* ```parse_json```: 將請求的 HTTP body 部分的數據當作 JSON 格式解析到特定的類型;
* ```parse_form```: 將請求的 HTTP body 部分的數據當作 Form 表單解析到特定的類型;
* ```parse_body```: 根據請求的 ```content-type``` 的類型, 將 HTTP body 部分的數據解析為特定類型. 
* ```parse_data```: 可以合並不同的數據源解析出特定的類型, 可以接受的數據源有: router params, URL queries, HTTP headers, ```Form```. 為了防止出現意外錯誤, 各個數據源不能存在相同的鍵名. 比如: ```http://localhost/users/<id>?id=123```, ```<id>``` 代表路由匹配得到的 ```id```,  URL queries 部分也存在一個 ```id=123```, 此時就不能合並 router params 和 URL queries 解析為特定類型.

### 解析原理

此處通過自定義的 ```serde::Deserializer``` 將類似 ```HashMap<String, String>``` 和 ```HashMap<String, Vec<String>>``` 的數據解析為特定的數據類型.

比如: ```URL queries``` 實際上被解析為一個 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 類型, ```MultiMap``` 可以認為就是一個類似 ```HashMap<String, Vec<String>>``` 的數據結構. 如果請求的 URL 是 ```http://localhost/users?id=123&id=234```, 我們提供的目標類型是:

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

可以合並多個數據源, 解析出特定類型, 首先是定義數據源:

```rust
use enumflags2::make_bitflags;

let source = make_bitflags!(ParseSource::{Queries|Form});
```

此處合並了 ```URL queries``` 和 ```Form``` 部分的數據, 然後調用 ```parse_data``` 解析即可. 具體實例參見: [parse-data](https://github.com/salvo-rs/salvo/blob/main/examples/parse-data/src/main.rs).