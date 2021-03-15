---
title: "Router"
weight: 2
menu:
  book:
    parent: "concepts"
---


Router 用于过滤请求, 然后将请求发送给不同的 Handler 处理.
最常用的过滤是 path 和 method. path 匹配路径信息; method 匹配请求的 Method.
过滤条件之间可以使用 and, or 连接, 比如:

```rust
Router::new().filter(filter::path("hello").and(filter::get()));
```
