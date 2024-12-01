# Response

In `Handler`, [`Response`](https://docs.rs/salvo_core/latest/salvo_core/http/response/struct.Response.html) will be passed as a parameter:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
res.render("Hello world!");
}
```

`Response` After the server receives the client request, any matching `Handler` and middleware can write data to it. In some cases, such as a middleware that wants to prevent subsequent middleware and `Handler` from executing, you can use `FlowCtrl`:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
ctrl.skip_rest();
res.render("Hello world!");
}
```

## Writing Content

Writing data to a `Response` is very simple:

- Writing plain text data

```rust
res.render("Hello world!");
```

- Writing JSON serialized data

```rust
use serde::Serialize;
use salvo::prelude::Json;

#[derive(Serialize, Debug)]
struct User {
name: String,
}
let user = User{name: "jobs".to_string()};
res.render(Json(user));
```

- Writing HTML

```rust
res.render(Text::Html("<html><body>hello</body></html>"));
```

## Writing HTTP Errors

- Use `render` to write detailed error information to a `Response`.

```rust
use salvo::http::errors::*;
res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
```

- If you don't need custom error messages, you can call `set_http_code` directly.

```rust
use salvo::http::StatusCode;
res.status_code(StatusCode::BAD_REQUEST);
```

## Redirect to another URL
- Use the `render` method to write a redirect response to a `Response`, navigating to a new URL. When you call the Redirect::found method, it sets the HTTP status code to 302 (Found), indicating a temporary redirect.
```rust
use salvo::prelude::*;

#[handler]
async fn redirect(res: &mut Response) {
res.render(Redirect::found("https://salvo.rs/"));
}
```

## ResBody

The Body type returned by Response is `ResBody`, which is an enumeration. When an error occurs, it is set to `ResBody::Error`, which contains error information and is used to delay error processing. `StatusError` does not actually implement `Writer`, but is designed to allow you to customize your display method in `Catcher`.
