# Serve Static

将静态文件或者内嵌的文件作为服务提供的中间件. 具体 API 请[查看文档](https://docs.rs/salvo_extra/latest/salvo_extra/request_id/index.html).

## 主要功能

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

  `StaticDir` 支持在存在压缩文件的情况下，优先发送压缩文件. 比如存在 `index.html`, `index.html.gz`, `index.html.zst`, `index.html.br` 这几个文件，则 `index.html.gz`, `index.html.zst`, `index.html.br` 被认为是 `index.html` 的预压缩版本，会根据请求信息，发送对应的压缩文件. 
    

* 提供了对 `rust-embed` 的支持, 比如:
   
    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

可以通过 default 设置默认显示页面.  `with_fallback` 和 `fallback` 可以设置在文件找不到时, 用这里设置的文件代替, 这个对应某些单页网站应用来还是有用的.