---
title: "Hello World"
linkTitle: "Hello World"
weight: 2
menu:
  book:
    parent: "quick start"
---


Create a new rust project:
```bash
cargo new hello --bin
```

Add this to `Cargo.toml`
```toml
[dependencies]
salvo = "0.5"
tokio = { version = "1.0", features = ["full"] }
```

Create a simple function handler in the main.rs file, we call it `hello_world`, this function just render plain text "Hello World".

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render_plain_text("Hello World");
}
```

In the main function, we need to create a root Router first, and then create a server and call it's serve function:

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render_plain_text("Hello World");
}

#[tokio::main]
async fn main() {
    let router = Router::new().get(hello_world);
    let server = Server::new(router);
    server.bind(([0, 0, 0, 0], 7878)).await;
}
```