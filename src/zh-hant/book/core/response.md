# Response

在 `Handler` 中, ```Response``` 會被作爲參數傳入:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("Hello world!");
}
```

在伺服器接收到客戶端請求後，任何匹配的 ```Handler``` 以及中間件都可以向 ```Response``` 中寫入數據。在特定情況下，例如當一個中間件想要阻止後續中間件和 `Handler` 的執行時，您可以使用 ```FlowCtrl```
```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
    ctrl.skip_rest();
    res.render("Hello world!");
}
```

## 寫入內容

向 ```Response``` 中寫入數據是非常簡單的:

- 寫入純文本數據

    ```rust
    res.render("Hello world!");
    ``` 

- 寫入 JSON 序列化數據
    
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

- 寫入 HTML
    
    ```rust
    res.render(Text::Html("<html><body>hello</body></html>"));
    ```

## 寫入 HTTP 錯誤


- 使用 ```render``` 可以向 ```Response``` 寫入詳細錯誤信息.

    ```rust
    use salvo::http::errors::*;
    res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
    ```

- 如果您不需要自定義錯誤信息, 可以直接調用 ```set_http_code```.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```

## 重定向到其他URL
- 使用 ```render``` 方法可以向 ```Response``` 寫入一個重定向回應，導航到一個新的URL。當你調用 Redirect::found 方法時，它會設置 HTTP 狀態碼為 302（Found），表示暫時重定向。
```rust
use salvo::prelude::*;

#[handler]
async fn redirect(res: &mut Response) {
    res.render(Redirect::found("https://salvo.rs/"));
}
```