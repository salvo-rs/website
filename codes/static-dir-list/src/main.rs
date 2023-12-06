use salvo::prelude::*;
use salvo::serve_static::StaticDir;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let router = Router::with_path("<**path>").get(
        StaticDir::new([
            "examples/static-dir-list/static/boy",
            "examples/static-dir-list/static/girl",
        ])
        .defaults("index.html")
        .auto_list(true),
    );

    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    Server::new(acceptor).serve(router).await;
}
