# Proxy

提供反向代理功能的中間件.

## 示例代碼

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
                .handle(Proxy::<Vec<&str>>::new(vec!["https://www.google.com"])),
        )
        .push(
            Router::new()
                .path("baidu/<**rest>")
                .handle(Proxy::<Vec<&str>>::new(vec!["https://www.baidu.com"])),
        );
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await; Server::new(acceptor).serve(router).await;
}
```
