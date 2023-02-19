# 快速開始

## 安裝 Rust

如果你還沒有安裝 Rust, 你可以使用官方提供的 ```rustup``` 安裝 Rust. [官方教程](https://doc.rust-lang.org/book/ch01-01-installation.html) 中有如何安裝的詳細介紹.

當前 Salvo 支持的最低 Rust 版本為 1.64. 運行 ```rustup update``` 確認您已經安裝了符合要求的 Rust.

## 編寫第一個 Salvo 程序

創建一個全新的項目:

```bash
cargo new hello --bin
```

添加依賴項到 `Cargo.toml`

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"
publish = false

[dependencies]
salvo = "*"
tokio = { version = "1", features = ["macros"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

在 `main.rs` 中創建一個簡單的函數句柄, 命名為`hello`, 這個函數只是簡單地打印文本 ```"Hello world"```.

@[code rust](../../codes/hello/src/main.rs)

恭喜你, 你的一個 Salvo 程序已經完成. 只需要在命令行下運行 ```cargo run```, 然後在瀏覽器裏打開 ```http://127.0.0.1:5800``` 即可.

## 詳細解讀

這裏的 ```hello_world``` 是一個 ```Handler```, 用於處理用戶請求. ```#[handler]``` 可以讓一個函數方便實現 ```Handler``` trait. 並且, 它允許我們用不同的方式簡寫函數的參數.

- 原始形式:
  
    ```rust
    #[handler]
    async fn hello(_req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
        res.render("Hello world");
    }
    ```

- 您可以省略函數中某些用不著的參數, 比如這裏面的 ```_req```, ```_depot```, ```_ctrl``` 都沒有被使用, 可以直接不寫:
  
    ``` rust
    #[handler]
    async fn hello(res: &mut Response) {
        res.render("Hello world");
    }
    ```

- 任何類型都可以作為函數的返回類型, 只要它實現了 ```Writer``` trait. 比如 ```&str``` 實現了 ```Writer```, 當它被作為返回值時, 就打印純文本:

    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> &'static str {
        "Hello world"
    }
    ```

- 更普遍的情況是, 我們需要在將 ```Result<T, E>``` 作為返回類型, 以便處理函數執行過程中的錯誤. 如果 ```T``` 和 ```E``` 都實現了 ```Writer```, 那麽 ```Result<T, E>``` 就可以作為返回值:
  
    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> Result<&'static str, ()> {
        Ok("Hello world")
    }
    ```

## 風騷的 HTTP3

據說 HTTP3 身輕如燕，多少程序員思而不得。這會，Salvo 就幫大家實現願望，讓大家輕松享受到 HTTP3 帶來的美妙服務。

首先在 `Cargo.toml` 中啟用 HTTP3 功能, 然後把 `main.rs` 改成這樣：

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../codes/hello-h3/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/hello-h3/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## 更多示例
建議直接克隆 Salvo 倉庫, 然後運行 examples 目錄下的示例. 比如下面的命令可以運行 ```hello``` 的例子:

```sh
git clone https://github.com/salvo-rs/salvo
cd salvo
cargo run --bin example-hello
```

examples 目錄下有很多的例子. 都可以通過類似 ```cargo run --bin example-<name>``` 的命令運行.
