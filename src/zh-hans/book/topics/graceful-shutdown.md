# 优雅地停机


```rust
use salvo_core::prelude::*;

#[tokio::main]
async fn main() {
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    let server = Server::new(acceptor);
    let handle = server.handle();

    // 优雅地关闭服务器
    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(60)).await;
        handle.stop_graceful(None);
    });
    server.serve(Router::new()).await;
}
```