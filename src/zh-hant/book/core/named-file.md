# NamedFile

Salvo 提供了 ```salvo::fs::NamedFile```，這是一個用於高效地向客戶端傳送文件的工具。它不會將文件完全加載到內存中，而是會根據客戶端請求的 `Range` 頭部分載入並傳輸文件的特定部分。

_**示例代碼**_ 

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    res.send_file("/file/to/path", req.headers()).await;
}
```

事實上，使用 `Response::send_file` 方法僅僅是一種簡化的操作，它內部使用了 `NamedFile`。如果你需要對傳送的文件進行更細致的控制，應該使用 `NamedFileBuilder`。

你可以通過 `NamedFile::builder` 方法來創建一個 `NamedFileBuilder` 實例

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    let builder = NamedFile::builder("/file/to/path");
}
```

進行一系列的設置，最後發送文件：

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```
