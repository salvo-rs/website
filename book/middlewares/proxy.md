# Proxy

Middleware that provides reverse proxy functionality.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["proxy"] }
```

## Sample Code

```rust
use salvo::prelude::*;
use salvo::proxy::Proxy;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let router = Router::new()
        .push(
            Router::new()
                .path("google/<**rest>")
                .handle(Proxy::new("https://www.google.com")),
        )
        .push(
            Router::new()
                .path("baidu/<**rest>")
                .handle(Proxy::new("https://www.baidu.com")),
        );
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await; Server::new(acceptor).serve(router).await;
}
```
