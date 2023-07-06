# 優雅地停機


```rust
use tokio::sync::oneshot;

use salvo_core::prelude::*;

#[handler]
async fn hello(res: &mut Response) {
    res.render("Hello World!");
}

#[tokio::main]
async fn main() {
    let (tx, rx) = oneshot::channel();
    let router = Router::new().get(hello);
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    let server = Server::new(acceptor).serve_with_graceful_shutdown(router, async {
        rx.await.ok();
    }, None);

    // Spawn the server into a runtime
    tokio::task::spawn(server);

    // Later, start the shutdown...
    let _ = tx.send(());
}
```