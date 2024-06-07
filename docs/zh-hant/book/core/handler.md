# Handler

## 什麼是 Handler

Handler 是負責處理 Request 請求的實體。Handler 本身是一個特徵（Trait），其中包含了一個名為 ```handle``` 的非同步方法。

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

處理函數 `handle` 的預設簽名包含四個參數，分別是 `&mut Request、&mut Depot、&mut Response , &mut FlowCtrl`。Depot 用於暫存與該請求相關的數據。

中間件實際上也是 `Handler` 的一種形式，它們可以在請求被正式處理之前或之後執行某些操作，例如：進行用戶身份驗證、數據壓縮等。

中間件可以透過 `Router` 的 `hoop` 方法來添加。一旦添加，該中間件會影響當前的 `Router` 以及其內部所有的子 `Router`。

## `#[handler]` 宏的使用

使用 `#[handler]` 屬性可以顯著簡化代碼書寫並提高代碼靈活性。


它可以被加在函數上，從而讓該函數實現 `Handler` 特徵：

```rust
#[handler]
async fn hello() -> &'static str {
    "hello world!"
}
```

這等價於:

```rust
struct hello;

#[async_trait]
impl Handler for hello {
    async fn handle(&self, _req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
        res.render(Text::Plain("hello world!"));
    }
}
```

正確地，`#[handler]` 屬性的出現讓你在寫服務器處理邏輯時變得更加簡潔和直觀。它允許你將一個普通的異步函數，簡單地轉化為一個能夠處理網絡請求的處理器。以下是一些主要的優點：

- 省略 `#[async_trait]`。
- 參數靈活性： 使用 `#[handler]` 時，你可以根據需要選擇你的函數參數，且參數順序可以任意排列。
- 方便的返回類型： 如果你的函數返回值實現了 `Writer` 或 `Scribe` 特徵，那麼這個值可以直接作為函數的返回值。例如，`&'static str` 類型實現了 `Scribe` 特徵，因此它可以直接作為返回值。
`#[handler]` 不僅可以加在函數上, 也可以加在 `struct` 的 `impl` 上，讓 `struct` 實現 `Handler`, 這時 `impl` 代碼塊中的 `handle` 函數會被識別爲 `Handler` 中的 `handle` 的具體實現:

```rust
struct Hello;

#[handler]
impl Hello {
    async fn handle(&self, res: &mut Response) {
        res.render(Text::Plain("hello world!"));
    }
}
```

## 處理錯誤

在 Salvo 中，`Handler` 可以返回 `Result`，只要 `Result` 類型中的 `Ok` 和 `Err` 分別實現了 `Writer` 特徵。
考慮到 `anyhow` 庫的使用相當普遍，在啟用 `anyhow` 功能之後，`anyhow::Error` 會實現 `Writer` 特徵。`anyhow::Error` 會被轉換成 `InternalServerError`。

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.render(StatusError::internal_server_error());
    }
}
```

針對自定義錯誤類型，您可以根據需求輸出不同的錯誤頁面。

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

## 直接實現 Handler Trait

```rust
use salvo_core::prelude::*;
use crate::salvo_core::http::Body;

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
