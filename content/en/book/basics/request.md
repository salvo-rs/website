---
title: "Request"
linkTitle: "Request"
weight: 1030
menu:
  book:
    parent: "basics"
---

For web applications it’s crucial to react to the data a client sends to the server. In Salvo this information is provided by the request:

```rust
#[fn_handler]
async fn hello_world(req: &mut Request) -> String {
    req.get_param::<String>("id")
}
```