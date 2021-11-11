---
title: "错误处理"
weight: 1030
menu:
  book:
    parent: "quick-start"
---

Salvo 中的 fn_handler 可以返回 Result, 只需要 Result 中的 Ok 和 Err 的类型都实现 Writer trait, 考虑到 anyhow 的普遍使用, 默认提供了对 anyhow::Error 的 Writer 实现, 任何的 anyhow::Error 都被映射到了 InternalServerError.

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.set_http_error(crate::http::errors::InternalServerError());
    }
}
```

对于自定义的错误类型, 你可以按你需求输出不一样的错误页面, 这个完全取决于你的需求.

```rust
use salvo::anyhow;
use salvo::prelude::*;

struct CustomError;
#[async_trait]
impl Writer for CustomError {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.render_plain_text("custom error");
        res.set_http_error(InternalServerError());
    }
}

#[fn_handler]
async fn handle_anyhow() -> Result<(), anyhow::Error> {
    Err(anyhow::anyhow!("anyhow error"))
}
#[fn_handler]
async fn handle_custom() -> Result<(), CustomError> {
    Err(CustomError)
}

#[tokio::main]
async fn main() {
    let router = Router::new()
        .push(Router::new().path("anyhow").get(handle_anyhow))
        .push(Router::new().path("custom").get(handle_custom));
    Server::bind(&"127.0.0.1:7878".parse().unwrap()).serve(Service::new(router)).await.unwrap();
}
```