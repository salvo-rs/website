---
title: "世界, 你好!"
weight: 1010
menu:
  book:
    parent: "quick-start"
---

创建一个全新的项目:

```bash
cargo new hello_salvo --bin
```

添加依赖项到 `Cargo.toml`

```toml
[dependencies]
salvo = "0.16"
tokio = { version = "1", features = ["full"] }
```

在 `main.rs` 中创建一个简单的函数句柄, 命名为`hello_world`, 这个函数只是简单地打印文本 ```"Hello World"```.

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(_req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    res.render_plain_text("Hello World");
}
```

对于 fn_handler，可以根据需求和喜好有不同种写法.

- 可以将一些没有用到的参数省略掉, 比如这里的 ```_req```, ```_depot```.

    ``` rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) {
        res.render_plain_text("Hello World");
    }
    ```

- 对于任何实现 Writer 的类型都是可以直接作为函数返回值. 比如, ```&str``` 实现了 ```Writer```, 会直接按纯文本输出:

    ```rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) -> &'static str {
        "Hello World"
    }
    ```

- 更常见的情况是, 我们需要通过返回一个 ```Result<T, E>``` 来简化程序中的错误处理. 如果 ```Result<T, E>``` 中 ```T``` 和 ```E``` 都实现 ```Writer```, 则 ```Result<T, E>``` 可以直接作为函数返回类型:

    ```rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) -> Result<&'static str, ()> {
        Ok("Hello World")
    }
    ```

在 ```main``` 函数中, 我们需要首先创建一个根路由, 然后创建一个 Server 并且调用它的 ```bind``` 函数:

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world() -> &'static str {
    "Hello World"
}
#[tokio::main]
async fn main() {
    let router = Router::new().get(hello_world);
    Server::new(TcpListener::bind(([0, 0, 0, 0], 7878))).serve(router).await.unwrap();
}
```