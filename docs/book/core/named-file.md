# Static File

Salvo provides `salvo::fs::NamedFile`, which can be used to send files to clients efficiently:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::send_file("/file/to/path", req, res).await;
}
```

Actually, passing `Response::send_file` is just a simplified way of using `NamedFile`, if you need more control over the sent file, you can use `NamedFileBuilder`.

A `NamedFileBuilder` can be created via `NamedFile::builder`:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     let builder = NamedFile::builder("/file/to/path");
}
```

You can do some settings, and then send the file:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```
