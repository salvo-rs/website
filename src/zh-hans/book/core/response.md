# Response

在 `Handler` 中, ```Response``` 会被作为参数传入:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("Hello world!");
}
```

```Response``` 在服务器接收到客户端请求后, 任何匹配到的 `Handler` 和中间件都可以向里面写入数据. 在某些情况下, 比如某个中间件希望阻止后续的中间件和 `Handler` 执行, 您可以使用 ```FlowCtrl```:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
    ctrl.skip_rest();
    res.render("Hello world!");
}
```

## 写入内容

向 ```Response``` 中写入数据是非常简单的:

- 写入纯文本数据

    ```rust
    res.render("Hello world!");
    ``` 

- 写入 JSON 序列化数据
    
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

- 写入 HTML
    
    ```rust
    res.render(Text::Html("<html><body>hello</body></html>"));
    ```

## 写入 HTTP 错误


- 使用 ```render``` 可以向 ```Response``` 写入详细错误信息.

    ```rust
    use salvo::http::errors::*;
    res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
    ```

- 如果您不需要自定义错误信息, 可以直接调用 ```set_http_code```.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```

## 重定向到其他URL
- 使用 ```render``` 方法可以向 ```Response``` 写入一个重定向响应，导航到一个新的URL。当你调用 Redirect::found 方法时，它会设置 HTTP 状态码为 302（Found），表示临时重定向。
    ```rust
    use salvo::prelude::*;

    #[handler]
    async fn redirect(res: &mut Response) {
        res.render(Redirect::found("https://salvo.rs/"));
    }
    ```