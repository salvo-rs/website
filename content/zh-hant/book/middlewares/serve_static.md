---
title: "Serve Static"
weight: 8060
menu:
  book:
    parent: "middlewares"
---

將靜態文件或者內嵌的文件作為服務提供.

```rust
use salvo_core::routing::Router;
use salvo_core::Server;
use salvo_extra::serve::StaticDir;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();
    
    let router = Router::new()
        .path("<**path>")
        .get(StaticDir::new(vec!["examples/static/body", "examples/static/girl"]));
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```