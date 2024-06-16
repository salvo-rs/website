# Serve Static

Middleware that provides static files or embedded files as services.

## Main Features

* `StaticDir` provides support for static local folders. You can take a list of multiple folders as an argument. For example:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    If the corresponding file is not found in the first folder, it will look in the second folder.
 
    `StaticDir` supports sending compressed files first when compressed files exist. For example, if there are files `index.html`, `index.html.gz`, `index.html.zst`, `index.html.br`, then `index.html.gz`, `index.html. zst`, `index.html.br` are considered to be pre-compressed versions of `index.html`, and the corresponding compressed files will be sent according to the request information.

* Provides support for `rust-embed`, such as:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` can be set to replace the file set here when the file is not found, which is useful for some single-page website applications.