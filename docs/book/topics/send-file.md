# Send File

Salvo can send files in a number of ways:

### NamedFile

Salvo provides `salvo::::NamedFile`, which can be used to efficiently send files to the client. It does not load all files into the cache, but loads part of the content according to the requested `Range` sent to the client.

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

### Serve Static


Middleware that serves static files or embedded files as a service.

* `StaticDir` provides support for static local folders. It can take a list of multiple folders as an argument. For example:

     <CodeGroup>
     <CodeGroupItem title="main.rs" active>

     @[code rust](../../../codes/static-dir-list/src/main.rs)

     </CodeGroupItem>
     <CodeGroupItem title="Cargo.toml">

     @[code toml](../../../codes/static-dir-list/Cargo.toml)

     </CodeGroupItem>
     </CodeGroup>

     If the corresponding file is not found in the first folder, it will be found in the second folder.

* Provided support for `rust-embed`, such as:
   
     <CodeGroup>
     <CodeGroupItem title="main.rs" active>

     @[code rust](../../../codes/static-embed-files/src/main.rs)

     </CodeGroupItem>
     <CodeGroupItem title="Cargo.toml">

     @[code toml](../../../codes/static-embed-files/Cargo.toml)

     </CodeGroupItem>
     </CodeGroup>

     `with_fallback` can be set to use the file set here instead when the file cannot be found. This is still useful for some single-page website applications.