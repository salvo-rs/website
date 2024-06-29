# Serve Static

將靜態文件或者內嵌的文件作爲服務提供的中間件.

## 主要功能

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

  `StaticDir` 支持在存在壓縮文件的情況下，優先發送壓縮文件。比如存在 `index.html`, `index.html.gz`, `index.html.zst`, `index.html.br` 這幾個文件，則 `index.html.gz`, `index.html.zst`, `index.html.br` 被認爲是 `index.html` 的預壓縮版本，會根據請求信息，發送對應的壓縮文件。
    

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