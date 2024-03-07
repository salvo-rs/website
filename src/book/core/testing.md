# Testing

The test module provided by Salvo can help test Salvo's projects.

[Latest Doc](https://docs.rs/salvo_core/latest/salvo_core/test/index.html)

**Example:**

```rust
use salvo::prelude::*;

#[handler]
async fn hello_world() -> &'static str {
    "Hello World"
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    tracing::info!("Listening on http://127.0.0.1:5800");
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await; Server::new(acceptor).serve(route()).await;
}

fn route() -> Router {
    Router::new().get(hello_world)
}

#[cfg(test)]
mod tests {
    use salvo::prelude::*;
    use salvo::test::{ResponseExt, TestClient};

    #[tokio::test]
    async fn test_hello_world() {
        let service = Service::new(super::route());

        let content = TestClient::get(format!("http://127.0.0.1:5800/"))
            .send(&service)
            .await
            .take_string()
            .await
            .unwrap();
        assert_eq!(content, "Hello World");
    }
}
```
