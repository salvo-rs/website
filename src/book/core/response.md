# Response

We can get response reference as function handler parameter:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("hello world!");
}
```

When the server gets a client request but you only need to return a simple response (ie skip any middleware or other handlers), you can simply use ```FlowCtrl```:

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

- Use ```set_http_error``` can write a http error to response.

    ```rust
    use salvo::http::errors::*;
    res.set_http_error(StatusError::internal_server_error().with_summary("error when serialize object to json"))
    ```

- If you don't want to customize error message, just use ```set_http_code```.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```
