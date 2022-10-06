---
title: "Depot"
weight: 2020
menu:
  book:
    parent: "core"
---

Depot 是用於保存一次請求中涉及到的臨時數據. 中間件可以將自己處理的臨時數據放入 Depot, 供後續程序使用.

當一個服務器接收到一個客戶瀏覽器發來的請求後會創建一個 ```Depot``` 的實例. 這個實例會在所有的中間件和 ```Handler``` 處理完請求後被銷毀.

比如說, 我們可以在登錄的中間件中設置 ```current_user```, 然後在後續的中間件或者 ```Handler``` 中讀取當前用戶信息.

```rust
use salvo::prelude::*;

#[handler]
async fn set_user(depot: &mut Depot)  {
  depot.insert("current_user", "Elon Musk");
}
#[handler]
async fn home(depot: &mut Depot) -> String  {
  // 需要註意的是, 這裏的類型必須是 &str, 而不是 String, 因為當初存入的數據類型為 &str.
  let user = depot.get::<&str>("current_user").copied().unwrap();
  format!("Hey {}, I love your money and girls!", user)
}

#[tokio::main]
async fn main() {
    let router = Router::with_hoop(set_user).get(home);
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```