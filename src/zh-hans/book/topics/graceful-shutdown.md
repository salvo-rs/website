# 优雅地停机


```rust
use salvo::prelude::*;

#[handler]
async fn hello(res: &mut Response) {
    res.render("Hello World!");
}

#[tokio::main]
async fn main() {
    let router = Router::new().get(hello);
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    let server = Server::new(acceptor);
    let handle = server.handle();
    server.serve(router).await;
    // Gracefully shut down the server
    handle.stop_graceful(std::time::Duration::from_secs(5));
}
```