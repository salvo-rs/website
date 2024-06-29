# Response

We can get response reference as function handler parameter:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("hello world!");
}
```

When the server gets a client request but you only need to return a simple response (ie skip any middleware or other handlers), you can simply use `FlowCtrl`:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
    ctrl.skip_rest();
    res.render("hello world!");
}
```

## Write content

Write content is straightforward:

- Write plain text

    ```rust
    res.render("hello world!");
    ```

- Write serializable type as json format

    ```rust
    #[derive(Serialize, Debug)]
    struct User {
        name: String,
    }
    let user = User{name: "jobs".to_string()};
    res.render(Json(user));
    ```

- Write html text

    ```rust
    res.render(Text::Html("<html><body>hello</body></html>"));
    ```

## Write status error

- Use `render` can write a http error to response.

    ```rust
    use salvo::http::errors::*;
    res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
    ```

- If you don't want to customize error message, just use `status_code`.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```

## Redirect to Another URL
- Use the `render` method to write a redirect response into `Response`, which navigates to a new URL. When you invoke the Redirect::found method, it sets the HTTP status code to 302 (Found), indicating a temporary redirect.
    ```rust
    use salvo::prelude::*;

    #[handler]
    async fn redirect(res: &mut Response) {
        res.render(Redirect::found("https://salvo.rs/"));
    }
    ```