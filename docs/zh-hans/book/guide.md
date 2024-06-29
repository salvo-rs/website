# 快速开始

## 安装 Rust

如果你还没有安装 Rust, 你可以使用官方提供的 `rustup` 安装 Rust. [官方教程](https://doc.rust-lang.org/book/ch01-01-installation.html) 中有如何安装的详细介绍.

当前 Salvo 支持的最低 Rust 版本为 1.75. 运行 `rustup update` 确认您已经安装了符合要求的 Rust.

## 编写第一个 Salvo 程序

创建一个全新的项目:

```bash
cargo new hello --bin
```

添加依赖项到 `Cargo.toml`

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"
publish = false

[dependencies]
salvo = "0.59"
tokio = { version = "1", features = ["macros"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

在 `main.rs` 中创建一个简单的函数句柄, 命名为 `hello`, 这个函数只是简单地打印文本 `"Hello world"`.

@[code rust](../../../codes/hello/src/main.rs)

恭喜你, 你的一个 Salvo 程序已经完成. 只需要在命令行下运行 `cargo run`, 然后在浏览器里打开 `http://127.0.0.1:5800` 即可.

## 详细解读

这里的 `hello_world` 是一个 `Handler`, 用于处理用户请求. `#[handler]` 可以让一个函数方便实现 `Handler` trait. 并且, 它允许我们用不同的方式简写函数的参数.

- 原始形式:
  
    ```rust
    #[handler]
    async fn hello(_req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
        res.render("Hello world");
    }
    ```

- 您可以省略函数中某些用不着的参数, 比如这里面的 `_req`, `_depot`, `_ctrl` 都没有被使用, 可以直接不写:
  
    ``` rust
    #[handler]
    async fn hello(res: &mut Response) {
        res.render("Hello world");
    }
    ```

- 任何类型都可以作为函数的返回类型, 只要它实现了 `Writer` trait. 比如 `&str` 实现了 `Writer`, 当它被作为返回值时, 就打印纯文本:

    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> &'static str {
        "Hello world"
    }
    ```

- 更普遍的情况是, 我们需要在将 `Result<T, E>` 作为返回类型, 以便处理函数执行过程中的错误. 如果 `T` 和 `E` 都实现了 `Writer`, 那么 `Result<T, E>` 就可以作为返回值:
  
    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> Result<&'static str, ()> {
        Ok("Hello world")
    }
    ```

## 风骚的 HTTP3

据说 HTTP3 身轻如燕，多少程序员思而不得.这会，Salvo 就帮大家实现愿望，让大家轻松享受到 HTTP3 带来的美妙服务.

首先在 `Cargo.toml` 中启用 HTTP3 功能, 然后把 `main.rs` 改成这样：

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/hello-h3/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/hello-h3/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## 更多示例
建议直接克隆 Salvo 仓库, 然后运行 examples 目录下的示例. 比如下面的命令可以运行 `hello` 的例子:

```sh
git clone https://github.com/salvo-rs/salvo
cd salvo
cargo run --bin example-hello
```

examples 目录下有很多的例子. 都可以通过类似 `cargo run --bin example-<name>` 的命令运行.
