---
title: "Response"
weight: 1040
menu:
  book:
    parent: "basics"
---

We can get response reference as function handler paramer:

```rust
#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render("hello world!");
}
```

When server get a client request and in it's whole process cycle, any handler or middlewares can write to response object. In middleware, you may want to skip all reset middlewares and handler, you can use ```FlowCtrl```:

```rust
#[fn_handler]
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
    let user = User{name: "jobs"};
    res.render(Text::Json(user));
    ```

- Write html text
    
    ```rust
    res.render(Text::Html("<html><body>hello</body></html>"));
    ```

## Write http error

- Use ```set_http_error``` can write a http error to response.

    ```rust
    use salvo::http::errors::*;
    res.set_http_error(StatusError:internal_server_error().with_summary("error when serialize object to json"))
    ```

- If we don't want to customize error message, just use ```set_http_code```.

    ```rust
    use salvo::http::StatusCode;
    res.set_status_code(StatusCode::BAD_REQUEST);
    ```