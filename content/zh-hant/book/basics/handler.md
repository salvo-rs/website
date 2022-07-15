---
title: "Handler"
weight: 2010
menu:
  book:
    parent: "basics"
---

## 什麽是 Handler

Handler 是負責負責處理 Request 請求的具體對象.  Hander 本身是一個 Trait, 內部包含一個 ```handle``` 的異步方法:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

## 函數式 Handler

很多時候只是希望通過函數作為 ```Handler``` 處理請求. 可以添加 ```fn_handler``` 將普通函數轉為 ```Handler```.

處理函數默認簽名包含四個參數, 依次是, ```&mut Request, &mut Depot. &mut Response, &mut FlowCtrl```. Depot 是一個臨時存儲, 可以存儲本次請求相關的數據. 

中間件其實也是 ```Handler```, 它們可以對請求到達正式處理請求的 ```Handler``` 之前或者之後作一些處理 比如：登錄驗證, 數據壓縮等.

中間件是通過 ```Router``` 的 ```hoop``` 函數添加的. 被添加的中間件會影響當前的 ```Router``` 和它內部所有子孫 ```Router```.

正常項目中使用得最多的應該是 ```fn_handler```, 它是一個 ```proc macro```, 加在函數上可以將函數轉變成一個 ```Handler```:

```rust
#[fn_handler]
async fn hello_world(_req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    res.render("Hello world");
}
```

某些參數如果不需要, 可以直接省略. 事實上, 這三個參數的順序可以按喜好自由調整, 也可以省略任何一個或者多個參數. 下面這些寫法都是可以的:

```rust
#[fn_handler]
async fn hello_world(req: &mut Request, res: &mut Response) {
}
#[fn_handler]
async fn hello_world(depot: &mut Depot) {
}
#[fn_handler]
async fn hello_world(res: &mut Response) {
}
```

## 處理錯誤

Salvo 中的 ```fn_handler``` 可以返回 ```Result```, 只需要 ```Result``` 中的 ```Ok``` 和 ```Err``` 的類型都實現 ```Writer``` trait.
考慮到 anyow 的使用比較廣泛, 在開啟 ```anyhow``` 功能後, ```anyhow::Error``` 會實現 ```Writer``` trait. ```anyhow::Error``` 會被映射為 ```InternalServerError```. 

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.set_http_error(StatusError::internal_server_error());
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
        res.render("custom error");
        res.set_http_error(StatusError::internal_server_error());
    }
}

#[fn_handler]
async fn handle_anyhow() -> Result<(), anyhow::Error> {
    Err(anyhow::anyhow!("anyhow error"))
}
#[fn_handler]
async fn handle_custom() -> Result<(), CustomError> {
    Err(CustomError)
}

#[tokio::main]
async fn main() {
    let router = Router::new()
        .push(Router::new().path("anyhow").get(handle_anyhow))
        .push(Router::new().path("custom").get(handle_custom));
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```

## 直接實現 Handler Trait

```rust
pub struct MaxSizeHandler(u64);
#[async_trait]
impl Handler for MaxSizeHandler {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        if let Some(upper) = req.body().and_then(|body| body.size_hint().upper()) {
            if upper > self.0 {
                res.set_status_error(StatusError::payload_too_large());
                ctrl.skip_rest();
            } else {
                ctrl.call_next(req, depot, res).await;
            }
        }
    }
}
```