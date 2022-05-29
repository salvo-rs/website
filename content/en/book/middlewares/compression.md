---
title: "Compression"
weight: 8020
menu:
  book:
    parent: "middlewares"
---


```rust
use salvo_core::prelude::*;
use salvo_extra::compression;
use salvo_extra::serve::*;
use tracing_subscriber;
use tracing_subscriber::fmt::format::FmtSpan;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let router = Router::new()
        .push(
            Router::new()
                .path("ws_chat")
                .get(FileHandler::new("examples/ws_chat.rs")),
        )
        .push(
            Router::new()
                .hoop(compression::deflate())
                .path("sse_chat")
                .get(FileHandler::new("examples/sse_chat.rs")),
        )
        .push(
            Router::new()
                .hoop(compression::brotli())
                .path("todos")
                .get(FileHandler::new("examples/todos.rs")),
        )
        .push(
            Router::new()
                .hoop(compression::gzip())
                .path("examples/<*path>")
                .get(DirHandler::new("examples/")),
        );
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```