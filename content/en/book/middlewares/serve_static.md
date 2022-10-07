---
title: "Serve Static"
weight: 8060
menu:
  book:
    parent: "middlewares"
---

Middleware that provides static files or embedded files as services.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["serve-static"] }
```

## Main Features

* `StaticDir` provides support for static local folders. You can take a list of multiple folders as an argument. For example:

    ```rust
    use salvo_core::routing::Router;
    use salvo_core::Server;
    use salvo_extra::serve::StaticDir;

    #[tokio::main]
    async fn main() {
        tracing_subscriber::fmt().init();
        
        let router = Router::new()
            .path("<**path>")
            .get(StaticDir::new(vec!["examples/static/body", "examples/static/girl"]));
        Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
    }
    ```
    If the corresponding file is not found in the first folder, it will look in the second folder.

* Provides support for `rust-embed`, such as:
    ```rust
    use rust_embed::RustEmbed;
    use salvo::prelude::*;
    use salvo::serve_static::static_embed;

    #[derive(RustEmbed)]
    #[folder = "static"]
    struct Assets;

    #[tokio::main]
    async fn main() {
        tracing_subscriber::fmt().init();

        let router = Router::with_path("<**path>").get(static_embed::<Assets>().with_fallback("index.html"));
        tracing::info!("Listening on http://127.0.0.1:7878");
        Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
    }
    ```

    `with_fallback` can be set to replace the file set here when the file is not found, which is useful for some single-page website applications.