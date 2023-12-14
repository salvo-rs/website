# 優雅地停機


```rust
use salvo_core::prelude::*;

#[tokio::main]
async fn main() {
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    let server = Server::new(acceptor);
    let handle = server.handle();

    //優雅地關閉伺服器
    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;
        handle.stop_graceful(None);
    });
    server.serve(Router::new()).await;
}
```
