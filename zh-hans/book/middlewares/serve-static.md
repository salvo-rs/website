# Serve Static

将静态文件或者内嵌的文件作为服务提供的中间件.

## 配置 Cargo.toml

```toml
salvo = { version = "*", features = ["serve-static"] }
```

## 主要功能

* `StaticDir` 提供了对静态本地文件夹的支持. 可以将多个文件夹的列表作为参数. 比如:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    如果在第一个文件夹中找不到对应的文件, 则会到第二个文件夹中找.

* 提供了对 `rust-embed` 的支持, 比如:
   
    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` 可以设置在文件找不到时, 用这里设置的文件代替, 这个对应某些单页网站应用来还是有用的.