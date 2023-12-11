# CORS

CORS middleware can be used for [Cross-Origin Resource Sharing](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

Since the browser will send `Method::OPTIONS` requests, it is necessary to increase the processing of such requests. There are two ways to handle `OPTIONS` requests.

- `empty_handler` can be added to the root `Router`:

```rust
Router::with_hoop(cors).get(hello).options(handler::empty());
```

- You can add `cors` Handler on Catcher:

```rust
let cors = Cors::new()
        .allow_origin(["http://127.0.0.1:5800", "http://localhost:5800"])
        .allow_methods(vec![Method::GET, Method::POST, Method::DELETE])
        .allow_headers("authorization")
        .into_handler();
let acceptor = TcpListener::new("0.0.0.0:5600").bind().await;
let service = Service::new(router).catcher(Catcher::default().hoop(cors));
Server::new(acceptor).serve(service).await;
```

_**Example**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>