---
title: "SSE"
weight: 8080
menu:
  book:
    parent: "middlewares"
---

```rust
use std::convert::Infallible;
use std::time::Duration;

use futures_util::StreamExt;
use salvo::prelude::*;
use salvo_extra::sse::{self, SseEvent};
use tokio::time::interval;
use tokio_stream::wrappers::IntervalStream;

fn sse_counter(counter: u64) -> Result<SseEvent, Infallible> {
    Ok(SseEvent::default().data(counter.to_string()))
}

#[handler]
async fn handle_tick(_req: &mut Request, res: &mut Response) {
    let event_stream = {
        let mut counter: u64 = 0;
        let interval = interval(Duration::from_secs(1));
        let stream = IntervalStream::new(interval);
        let event_stream = stream.map(move |_| {
            counter += 1;
            sse_counter(counter)
        });
        event_stream
    };
    sse::streaming(res, event_stream);
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let router = Router::with_path("ticks").get(handle_tick);
    Server::new(TcpListener::bind("127.0.0.1:7878")).serve(router).await;
}

```