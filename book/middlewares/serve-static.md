# Serve Static

Middleware that provides static files or embedded files as services.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["serve-static"] }
```

## Main Features

* `StaticDir` provides support for static local folders. You can take a list of multiple folders as an argument. For example:


    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    If the corresponding file is not found in the first folder, it will look in the second folder.

* Provides support for `rust-embed`, such as:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` can be set to replace the file set here when the file is not found, which is useful for some single-page website applications.