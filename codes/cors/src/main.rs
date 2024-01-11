use salvo::cors::Cors;
use salvo::http::Method;
use salvo::prelude::*;

#[handler]
async fn hello() -> &'static str {
    "hello"
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let cors = Cors::new()
        .allow_origin("https://salvo.rs")
        .allow_methods(vec![Method::GET, Method::POST, Method::DELETE])
        .into_handler();

    let router = Router::new().get(hello);
    let service = Service::new(router).hoop(cors);

    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    Server::new(acceptor).serve(service).await;
}
