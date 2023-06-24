# 發送文件

Salvo 可以通過以下一些方式發送文件:

### NamedFile

Salvo 提供了 ```salvo::fs::NamedFile```, 可以用它高效地發送文件到客戶端. 它並不會把文件都加載入緩存, 而是根據請求的 `Range` 加載部分內容發送至客戶端.

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

### Serve Static


將靜態文件或者內嵌的文件作爲服務提供的中間件.

* `StaticDir` 提供了對靜態本地文件夾的支持. 可以將多個文件夾的列表作爲參數. 比如:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    如果在第一個文件夾中找不到對應的文件, 則會到第二個文件夾中找.

* 提供了對 `rust-embed` 的支持, 比如:
   
    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` 可以設置在文件找不到時, 用這裏設置的文件代替, 這個對應某些單頁網站應用來還是有用的.