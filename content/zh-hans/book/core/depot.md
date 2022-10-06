---
title: "Depot"
weight: 2020
menu:
  book:
    parent: "core"
---

Depot 是用于保存一次请求中涉及到的临时数据. 中间件可以将自己处理的临时数据放入 Depot, 供后续程序使用.

当一个服务器接收到一个客户浏览器发来的请求后会创建一个 ```Depot``` 的实例. 这个实例会在所有的中间件和 ```Handler``` 处理完请求后被销毁.

比如说, 我们可以在登录的中间件中设置 ```current_user```, 然后在后续的中间件或者 ```Handler``` 中读取当前用户信息.

```rust
use salvo::prelude::*;

#[handler]
async fn set_user(depot: &mut Depot)  {
  depot.insert("current_user", "Elon Musk");
}
#[handler]
async fn home(depot: &mut Depot) -> String  {
  // 需要注意的是, 这里的类型必须是 &str, 而不是 String, 因为当初存入的数据类型为 &str.
  let user = depot.get::<&str>("current_user").copied().unwrap();
  format!("Hey {}, I love your money and girls!", user)
}

#[tokio::main]
async fn main() {
    let router = Router::with_hoop(set_user).get(home);
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```