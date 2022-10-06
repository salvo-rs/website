---
title: "Depot"
weight: 1050
menu:
  book:
    parent: "core"
---


Depot is used to save data when process current request. It is useful for middlewares to share data.

A depot instance created when server get a request from client. The depot will dropped when all process for this request done.

For example, we can set ```current_user``` in ```set_user```, and then use this value in the following middlewares and handlers.

```rust
use salvo::prelude::*;

#[handler]
async fn set_user(depot: &mut Depot)  {
  depot.insert("current_user", "Elon Musk");
}
#[handler]
async fn home(depot: &mut Depot) -> String  {
  // Notic: Don't use String here, because you inserted a &str.
  let user = depot.get::<&str>("current_user").copied().unwrap();
  format!("Hey {}, I love your money and girls!", user)
}

#[tokio::main]
async fn main() {
    let router = Router::with_hoop(set_user).get(home);
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}
```