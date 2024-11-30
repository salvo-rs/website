# Response

在 `Handler` 中, [`Response`](https://docs.rs/salvo_core/latest/salvo_core/http/response/struct.Response.html) 會被作為參數傳入:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("Hello world!");
}
```

`Response` 在服務器接收到客戶端請求後, 任何匹配到的 `Handler` 和中間件都可以嚮裏麵寫入數據. 在某些情況下, 比如某個中間件希望阻止後續的中間件和 `Handler` 執行, 您可以使用 `FlowCtrl`:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
    ctrl.skip_rest();
    res.render("Hello world!");
}
```

## 寫入內容

嚮 `Response` 中寫入數據是非常簡單的:

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


- 使用 `render` 可以嚮 `Response` 寫入詳細錯誤信息.

    ```rust
    use salvo::http::errors::*;
    res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
    ```

- 如果您不需要自定義錯誤信息, 可以直接調用 `set_http_code`.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```

## 重定嚮到其他URL
- 使用 `render` 方法可以嚮 `Response` 寫入一個重定嚮響應，導航到一個新的URL. 當你調用 Redirect::found 方法時，它會設置 HTTP 狀態碼為 302（Found），錶示臨時重定嚮. 
    ```rust
    use salvo::prelude::*;

    #[handler]
    async fn redirect(res: &mut Response) {
        res.render(Redirect::found("https://salvo.rs/"));
    }
    ```


## ResBody

Response 返回的 Body 類型是 `ResBody`, 它是一個枚舉，在出錯時被設置為 `ResBody::Error` ,這裏包含錯誤的信息，用於延後處理錯誤，`StatusError` 實際上並冇實現 `Writer`, 目的是讓你可以在 `Catcher` 中自定義自己的顯示方式.
