# NamedFile

Salvo 提供了 `salvo::fs::NamedFile`, 可以用它高效地发送文件到客户端. 它并不会把文件都加载入缓存, 而是根据请求的 `Range` 加载部分内容发送至客户端.

_**示例代码**_ 

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    res.send_file("/file/to/path", req.headers()).await;
}
```

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
