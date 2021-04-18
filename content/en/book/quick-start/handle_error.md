---
title: "Handle Error"
weight: 1030
menu:
  book:
    parent: "quick-start"
---

The ```fn_handler``` in Salvo can return Result, only the types of ```Ok``` and ```Err``` in ```Result``` need to implement the ```Writer``` trait. Taking into account the widespread use of ```anyhow```, the ```Writer``` implementation of ```anyhow::Error``` is provided by default, and ```anyhow::Error``` is Mapped to ```InternalServerError```. 

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.set_http_error(crate::http::errors::InternalServerError());
    }
}
```

For custom error types, you can output different error pages according to your needs, which completely depends on your needs. 

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
    Server::new(router).bind(([0, 0, 0, 0], 7878)).await;
}
```