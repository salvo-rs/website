# Handler

## What is Handler

Handler is the specific object responsible for processing Request requests. Handler itself is a Trait, which contains an asynchronous method of ```handle```: 

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

The default signature of the `handle` function contains four parameters, in order, `&mut Request, &mut Depot. &mut Response, &mut FlowCtrl`. Depot is a temporary storage that can store data related to this request.

Middleware is actually also a `Handler`. They can do some processing before or after the request reaches the `Handler` that officially handles the request, such as: login verification, data compression, etc.

Middleware is added through the `hoop` function of `Router`. The added middleware will affect the current `Router` and all its internal descendants `Router`.

## Macro `#[handler]`

`#[handler]` can greatly simplify the writing of the code, and improve the flexibility of the code. 

It can be added to a function to make it implement `Handler`:

```rust
#[handler]
async fn hello() -> &'static str {
    "hello world!"
}
```

This is equivalent to:

```rust
struct hello;

#[async_trait]
impl Handler for hello {
    async fn handle(&self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.render(Text::Plain("hello world!"));
    }
}
```

As you can see, in the case of using `#[handler]`, the code becomes much simpler:
- No need to manually add `#[async_trait]`.
- The parameters that are not needed in the function have been omitted, and the required parameters can be arranged in any order.
- For objects that implement `Writer` or `Scribe` abstraction, it can be directly used as the return value of the function. Here `&'static str` implements `Scribe`, so it can be returned directly as the return value of the function.

`#[handler]` can not only be added to the function, but also can be added to the `impl` of `struct` to let `struct` implement `Handler`. At this time, the `handle` function in the `impl` code block will be Identified as the specific implementation of `handle` in `Handler`:

```rust
struct Hello;

#[handler]
impl Hello {
    async fn handle(&self, res: &mut Response) {
        res.render(Text::Plain("hello world!"));
    }
}
```

## Handle errors

`Handler` in Salvo can return `Result`, only the types of `Ok` and `Err` in `Result` are implemented `Writer` trait. 
Taking into account the widespread use of `anyhow`, the `Writer` implementation of `anyhow::Error` is provided by default, and `anyhow::Error` is Mapped to `InternalServerError`. 

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.render(StatusError::internal_server_error());
    }
}
```

For custom error types, you can output different error pages according to your needs. 

```rust
use salvo::anyhow;
use salvo::prelude::*;

struct CustomError;
#[async_trait]
impl Writer for CustomError {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.status_code(StatusCode::INTERNAL_SERVER_ERROR);
        res.render("custom error");
    }
}

#[handler]
async fn handle_anyhow() -> Result<(), anyhow::Error> {
    Err(anyhow::anyhow!("anyhow error"))
}
#[handler]
async fn handle_custom() -> Result<(), CustomError> {
    Err(CustomError)
}

#[tokio::main]
async fn main() {
    let router = Router::new()
        .push(Router::new().path("anyhow").get(handle_anyhow))
        .push(Router::new().path("custom").get(handle_custom));
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    Server::new(acceptor).serve(router).await;
}
```

## Implement Handler trait directly

Under certain circumstances, We need to implment `Handler` direclty.

```rust
pub struct MaxSizeHandler(u64);
#[async_trait]
impl Handler for MaxSizeHandler {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        if let Some(upper) = req.body().and_then(|body| body.size_hint().upper()) {
            if upper > self.0 {
                res.render(StatusError::payload_too_large());
                ctrl.skip_rest();
            } else {
                ctrl.call_next(req, depot, res).await;
            }
        }
    }
}
```