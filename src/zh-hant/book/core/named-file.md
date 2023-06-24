# NamedFile

Salvo 提供了 ```salvo::fs::NamedFile```, 可以用它高效地發送文件到客戶端. 它並不會把文件都加載入緩存, 而是根據請求的 `Range` 加載部分內容發送至客戶端.

_**示例代碼**_ 

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    res.send_file("/file/to/path", req.headers()).await;
}
```

實際上, 通過 `Response::send_file` 只是一種簡化的使用 `NamedFile` 的方式, 如果你需要對發送的文件進行更多的控制, 可以使用 `NamedFileBuilder`.

通過 `NamedFile::builder` 可以創建 `NamedFileBuilder`:


```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    let builder = NamedFile::builder("/file/to/path");
}
```

可以做一些設置, 然後發送文件:


```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```
