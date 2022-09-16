---
title: "WebSocket"
weight: 8090
menu:
  book:
    parent: "middlewares"
---


```rust
use salvo::extra::ws::WebSocketUpgrade;
use salvo::prelude::*;
use serde::{Deserialize, Serialize};

#[handler]
async fn connect(req: &mut Request, res: &mut Response) -> Result<(), StatusError> {
    WebSocketUpgrade::new()
        .upgrade(req, res, |mut ws| async move {
            while let Some(msg) = ws.recv().await {
                let msg = if let Ok(msg) = msg {
                    msg
                } else {
                    // client disconnected
                    return;
                };

                if ws.send(msg).await.is_err() {
                    // client disconnected
                    return;
                }
            }
        })
        .await
}

#[handler]
async fn index(res: &mut Response) {
    res.render(Text::Html(INDEX_HTML));
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();
    let router = Router::new().get(index).push(Router::with_path("ws").handle(connect));
    tracing::info!("Listening on http://127.0.0.1:7878");
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}

static INDEX_HTML: &str = r#"<!DOCTYPE html>
<html>
    <head>
        <title>WS</title>
    </head>
    <body>
        <h1>WS</h1>
        <div id="status">
            <p><em>Connecting...</em></p>
        </div>
        <script>
            const status = document.getElementById('status');
            const msg = document.getElementById('msg');
            const submit = document.getElementById('submit');
            const ws = new WebSocket(`ws://${location.host}/ws?id=123&name=dddf`);

            ws.onopen = function() {
                status.innerHTML = '<p><em>Connected!</em></p>';
            };
        </script>
    </body>
</html>
"#;

```