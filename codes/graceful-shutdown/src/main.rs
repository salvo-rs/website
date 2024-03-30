use salvo::prelude::*;
use std::time::Duration;

#[handler]
async fn hello() -> &'static str {
    "Hello World"
}

async fn before_shutdown(kind: &str) {
    tracing::info!("Received {} signal", kind);
    tracing::info!("Cleaning up...");
    for i in (1..=3).rev() {
        tracing::info!("Finishing in {}...", i);
        tokio::time::sleep(Duration::from_secs(1)).await;
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let router = Router::new().get(hello);
    let service = Service::new(router).hoop(Logger::new());

    let acceptor = TcpListener::new("0.0.0.0:5800").bind().await;
    let server = Server::new(acceptor);
    let handle = server.handle();

    // Graceful shutdown the server
    tokio::spawn(async move {
        use tokio::signal::ctrl_c;
        use tokio::signal::unix::{signal, SignalKind};
        let mut sigterm = signal(SignalKind::terminate()).unwrap();
        let mut sigint = signal(SignalKind::interrupt()).unwrap();

        tokio::select! {
            _ = sigterm.recv() => before_shutdown("terminate").await,
            _ = sigint.recv() => before_shutdown("interrupt").await,
            _ = ctrl_c() => before_shutdown("ctrl-c").await
        };
        handle.stop_graceful(None);
    });
    server.serve(service).await;
}
