# Handler

## What is Handler

Handler is the specific object responsible for processing Request requests. Handler itself is a Trait, which contains an asynchronous method of `handle`:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

The default signature of the `handle` function contains four parameters, in order, `&mut Request, &mut Depot. &mut Response, &mut FlowCtrl`. Depot is a temporary storage that can store data related to this request.

Middleware is actually also a `Handler`. They can do some processing before or after the request reaches the `Handler` that officially handles the request, such as: login verification, data compression, etc.

Middleware is added through the `hoop` function of `Router`. The added middleware will affect the current `Router` and all its internal descendants `Router`.

## `Handler` as middleware

When `Handler` is used as middleware, it can be added to the following three types of objects that support middleware:

- `Service`, any request will pass through middlewares in `Service`.

- `Router`, only when the route matching is successful, the request will pass through middlewares defined in `Service` and all middlewares collected on the matching path.

- `Catcher`, when an error occurs and no custom error information is written, the request will pass through the middleware in `Catcher`.

### Example

Suppose you want to create a really simple api key middleware where we check if an api key from a header matches an api key. For this example we will have the api key stored as a constant.

Define the middleware handler:

```rust
use salvo::prelude::*;

const API_KEY: &str = "api_key_value...";

#[handler]
async fn auth_middleware(req: &mut Request, res: &mut Respons) -> &'static str {
//  NOTE:  Extract the auth token from header
    let auth_token = match req.headers().get("API_KEY") {
        Some(value) => match value.to_str() {
            Ok(value) => value,
            Err(e) => {
            //  NOTE:  If there is an error reading it return with status unauthorized
                res.status_code(StatusCode::UNAUTHORIZED);
                res.render(Text::Plain("Couldn't read API Key"));
                return;
            }
        },
        None => {
            //  NOTE:  If AUTH_TOKEN header is not in request return with status unauthorized
            res.status_code(StatusCode::UNAUTHORIZED);
            res.render(Text::Plain("Missing API Key"));
            return;
        }
    };

    //  NOTE:  If AUTH_TOKEN header value return with status unauthorized
    if auth_token != API_KEY  {
        res.status_code(StatusCode::UNAUTHORIZED);
        res.render(Text::Plain("Invalid API Key"));
        return;
    }

    //  NOTE: If all checks passed the middleware handler ends and continue with the next handler
}
```

Add the middleware to your router

```rust
// Then in your router you can add the handler in different ways (specified in the above section)
// here we add the handler in the router with the hoop method, so all the routes bellow
// will be protected by the handler

#[tokio::main]
async fn main() {
let api_router = Router::with_path("api")
    .hoop(auth_middleware)
    .push(Router::with_path("my_route").get(another_handler))
    .push(Router::with_path("my_route_2").post(another_handler_2));

// ...
}


```

**Note:** Check the Middleware Section of the documentation to see prebuilt middlewares

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
    async fn handle(&self, _req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
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
use salvo_core::prelude::*;
use crate::salvo_core::http::Body;

pub struct MaxSizeHandler(u64);
#[async_trait]
impl Handler for MaxSizeHandler {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        if let Some(upper) = req.body().size_hint().upper() {
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
