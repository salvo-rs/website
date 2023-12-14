# Handler

## 什麼是 Handler

Handler 是負責處理 Request 請求的具體對象.  Handler 本身是一個 Trait, 內部包含一個 ```handle``` 的異步方法:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

處理函數 `handle` 默認簽名包含四個參數, 依次是, `&mut Request, &mut Depot. &mut Response, &mut FlowCtrl`. Depot 是一個臨時存儲, 可以存儲本次請求相關的數據. 

中間件其實也是 `Handler`, 它們可以對請求到達正式處理請求的 `Handler` 之前或者之後作一些處理 比如：登錄驗證, 數據壓縮等.

中間件是通過 `Router` 的 `hoop` 函數添加的. 被添加的中間件會影響當前的 `Router` 和它內部所有子孫 `Router`.


## `#[handler]` 宏的使用

`#[handler]` 可以大量簡化代碼的書寫, 並且提升代碼的靈活度. 

它可以加在一個函數上, 讓它實現 `Handler`:

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

可以看到, 在使用 `#[handler]` 的情況下, 代碼變得簡單很多:
- 不再需要手工添加 `#[async_trait]`.
- 函數中不需要的參數已經省略, 對於需要的參數也可以按任意順序排布.
- 對於實現了 `Writer` 或者 `Scribe` 抽象的對象, 可以直接作爲函數的返回值. 在這裏 `&'static str` 實現了 `Scribe`, 於是可以直接作爲函數返回值返回.

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

Salvo 中的 `Handler` 可以返回 `Result`, 只需要 `Result` 中的 `Ok` 和 `Err` 的類型都實現 `Writer` trait.
考慮到 anyhow 的使用比較廣泛, 在開啓 `anyhow` 功能後, `anyhow::Error` 會實現 `Writer` trait. `anyhow::Error` 會被映射爲 `InternalServerError`. 

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, res: &mut Response) {
        res.render(StatusError::internal_server_error());
    }
}
```

對於自定義錯誤類型, 你可以根據需要輸出不同的錯誤頁面.

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
