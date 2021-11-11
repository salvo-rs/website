---
title: "Serve"
weight: 8060
menu:
  book:
    parent: "middlewares"
---


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
    Server::bind(&"127.0.0.1:7878".parse().unwrap()).serve(Service::new(router)).await.unwrap();
}
```