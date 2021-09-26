---
title: "Hello World"
linkTitle: "Hello World"
weight: 1010
menu:
  book:
    parent: "quick-start"
---


Create a new rust project:

```bash
cargo new hello_salvo --bin
```

Add this to `Cargo.toml`

```toml
[dependencies]
salvo = "0.12"
tokio = { version = "1", features = ["full"] }
```

Create a simple function handler in the main.rs file, we call it `hello_world`, this function just render plain text ```"Hello World"```.

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(_req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    res.render_plain_text("Hello World");
}
```

There are many ways to write function handler.
- You can omit function arguments if they do not used, like ```_req```, ```_depot``` in this example:

    ``` rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) {
        res.render_plain_text("Hello World");
    }
    ```

- Any type can be function handler's return value if it implements ```Writer```. For example &str implements ```Writer``` and it will render string as plain text:

    ```rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) -> &'static str {// just return &str
        "Hello World"
    }
    ```

- The more common situation is we want to return a ```Result<T, E>``` to implify error handling. If ```T``` and ```E``` implements ```Writer```, ```Result<T, E>``` can be function handler's return type:
  
    ```rust
    #[fn_handler]
    async fn hello_world(res: &mut Response) -> Result<&'static str, ()> {// return Result
        Ok("Hello World")
    }
    ```

In the ```main``` function, we need to create a root Router first, and then create a server and call it's ```bind``` function:

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world() -> &'static str {
    "Hello World"
}
#[tokio::main]
async fn main() {
    let router = Router::new().get(hello_world);
    let server = Server::new(router);
    server.bind(([0, 0, 0, 0], 7878)).await;
}
```