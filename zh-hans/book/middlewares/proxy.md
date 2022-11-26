# Proxy

提供反向代理功能的中间件.

## 配置 Cargo.toml

```toml
salvo = { version = "*", features = ["proxy"] }
```

## 示例代码

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
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```
