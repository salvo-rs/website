---
title: "Response"
weight: 1040
menu:
  book:
    parent: "basics"
---


```rust
#[fn_handler]
async fn hello_world(req: &mut Request) {
    res.render_plain_text("hello world!");
}
```