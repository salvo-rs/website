# 发送文件

Salvo 可以通过以下一些方式发送文件:

### NamedFile

Salvo 提供了 `salvo::fs::NamedFile`, 可以用它高效地发送文件到客户端. 它并不会把文件都加载入缓存, 而是根据请求的 `Range` 加载部分内容发送至客户端.

实际上, 通过 `Response::send_file` 只是一种简化的使用 `NamedFile` 的方式, 如果你需要对发送的文件进行更多的控制, 可以使用 `NamedFileBuilder`.

通过 `NamedFile::builder` 可以创建 `NamedFileBuilder`:


```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    let builder = NamedFile::builder("/file/to/path");
}
```

可以做一些设置, 然后发送文件:


```rust 
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```

### Serve Static


将静态文件或者内嵌的文件作为服务提供的中间件.

* `StaticDir` 提供了对静态本地文件夹的支持. 可以将多个文件夹的列表作为参数. 比如:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    如果在第一个文件夹中找不到对应的文件, 则会到第二个文件夹中找.

* 提供了对 `rust-embed` 的支持, 比如:
   
    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` 可以设置在文件找不到时, 用这里设置的文件代替, 这个对应某些单页网站应用来还是有用的.