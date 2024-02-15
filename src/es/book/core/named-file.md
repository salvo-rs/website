# Achivo Estático

Salvo provee `salvo::fs::NamedFile`, que se puede usar para enviar archivos a los clientes de manera eficiente:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::send_file("/file/to/path", req, res).await;
}
```

Actualmente `Response::send_file` es una forma simplificada de usar `NamedFile`, si necesitas más control sobre el envío de archivo, puedes usar `NamedFileBuilder`.

Un `NamedFileBuilder` puede ser creado vía `NamedFile::builder`:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     let builder = NamedFile::builder("/file/to/path");
}
```

Puedes realizar algunas configuraciones y luego enviar el archivo:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```
