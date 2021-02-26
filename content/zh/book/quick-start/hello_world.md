---
title: "世界, 你好!"
weight: 2
menu:
  book:
    parent: "quick-start"
---


创建一个新的 rust 项目:
```bash
cargo new salvo_taste --bin
```

添加 ```salvo``` 依赖至 `Cargo.toml`
```toml
[dependencies]
salvo = "0.5"
tokio = { version = "1.0", features = ["full"] }
```

在 ```main.rs``` 文件中创建一个简单的函数句柄, 函数名为 `hello_world`, 这个函数句柄只是简单地输出纯文本 "Hello World".

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render_plain_text("Hello World");
}
```

在 ```main``` 函数中, 需要创建一个根路由, 并且创建一个 ```Server``` 实例, 并启动:

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(res: &mut Response) {
    res.render_plain_text("Hello World");
}

#[tokio::main]
async fn main() {
    let router = Router::new().get(hello_world);
    let server = Server::new(router);
    server.bind(([0, 0, 0, 0], 7878)).await;
}
```