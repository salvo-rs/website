---
title: "解析 Request 数据"
weight: 2101
menu:
  book:
    parent: "advanced"
---

### 解析的数据源

一个请求中的数据包含以下几个部分:

* ```Router params```: 指路由路径匹配中的得到的参数列表。 比如： ```Router::with_path("/users/<id>/")``` 中的 ```id```.
* ```URL queries```: 从 URL 的查询字符串中解析道的参数列表. 比如 ```http://localhost/user_id=123``` 中的 ```123```.
* ```Headers```: 请求头部的参数列表.
* ```Form```: 以 ```POST``` 形式提交的参数列表.

可以通过 ```Request``` 提供多个方法将这些数据解析为强类型结构.

* ```parse_params```: 将请求的 ```Router params``` 解析为特定的数据类型;
* ```parse_queries```: 将请求的 ```URL queries``` 解析为特定的数据类型;
* ```parse_headers```: 将请求的 ```Headers``` 解析为特定的数据类型;
* ```parse_json```: 将请求的 ```body``` 部分的数据当作 JSON 格式解析到特定的类型;
* ```parse_form```: 将请求的 ```body``` 部分的数据当作 Form 表单解析到特定的类型;
* ```parse_body```: 根据请求的 ```content-type``` 的类型, 将 ```body``` 部分的数据解析为特定类型. 
* ```parse_data```: 可以合并不同的数据源解析出特定的类型, 可以接受的数据源有: ```Router params```, ```URL queries```, ```Headers```, ```Form```. 为了防止出现意外错误, 各个数据源不能存在相同的键名. 比如: ```http://localhost/users/<id>?id=123```, ```<id>``` 代表路由匹配得到的 ```id```,  ```URL queries``` 部分也存在一个 ```id=123```, 此时就不能合并 ```Router params``` 和 ```URL queries``` 解析为特定类型.

### 解析原理

此处通过自定义的 ```serde``` ```Deserializer``` 将类似 ```HashMap<String, String>``` 和 ```HashMap<String, Vec<String>>``` 的数据解析为特定的数据类型.

比如: ```URL queries``` 实际上被解析为一个 [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html) 类型, ```MultiMap``` 可以认为就是一个类似 ```HashMap<String, Vec<String>>``` 的数据结构. 如果请求的 URL 是 ```http://localhost/users?id=123&id=234```, 我们提供的目标类型是:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

则第一个 ```id=123``` 会被解析, ```id=234``` 则被丢弃:

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

则 ```id=123&id=234``` 都会被解析:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

可以合并多个数据源, 解析出特定类型, 首先是定义数据源:

```rust
use enumflags2::make_bitflags;

let source = make_bitflags!(ParseSource::{Queries|Form});
```

此处合并了 ```URL queries``` 和 ```Form``` 部分的数据, 然后调用 ```parse_data``` 解析即可. 具体实例参见: [parse-data](https://github.com/salvo-rs/salvo/blob/main/examples/parse-data/src/main.rs).