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
    res.render_plain_text("hello world!");
}
```

When server get a client request and in it's whole process cycle, any handler or middle can write to response object. There is a function called ```commit``` defined in ```Response```:

```rust
#[inline]
pub fn commit(&mut self) {
    if self.is_committed {
        return;
    }
    for cookie in self.cookies.delta() {
        if let Ok(hv) = cookie.encoded().to_string().parse() {
            self.headers.append(SET_COOKIE, hv);
        }
    }
    self.is_committed = true;
}
```

Salvo executes before handler and path handler in sequence, when the response is in a committed state, subsequent handlers will not be executed, and then all after handlers will be executed. This is a sign that the http request is completed, which can be used to process early return verification logic, such as permission verification, etc.

## Write content
Write content is straightforward:

- Write plain text

    ```rust
    res.render_plain_text("hello world!");
    ``` 

- Write serializable type as json format
    
    ```rust
    #[derive(Serialize, Debug)]
    struct User {
        name: String,
    }
    let user = User{name: "jobs"};
    res.render_json(&user);
    ```

- Write html text
    
    ```rust
    res.render_json("<html><body>hello</body></html>");
    ```

## Write error

After error code or http error set, 

- Use ```set_http_error``` can write a http error to response.

    ```rust
    use salvo::http::errors::*;
    res.set_http_error(InternalServerError().with_summary("error when serialize object to json"))
    ```

- If we don't want to customize error message, just use ```set_http_code```.

    ```rust
    use salvo::http::StatusCode;
    res.set_status_code(StatusCode::BAD_REQUEST);
    ```