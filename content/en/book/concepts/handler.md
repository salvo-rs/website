---
title: "Handler"
weight: 2010
menu:
  book:
    parent: "concepts"
---

Handler is a trait, it only contains a sync function called handle.

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```
Use funcation as handler is a more common scenario. You can add #[fn_handler] to translate the function to a handler.

```rust
#[fn_handler]
async fn hello_world(req: &mut Request, depot: &mut Depot, res: &mut Response) {
    res.render_plain_text("Hello World");
}
```

If depot and req is not used in the function, you can omit them.

```rust
#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render_plain_text("Hello World");
}
```