# CORS

CORS 中間件可以用於 [跨源資源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

由於瀏覽器會發 `Method::OPTIONS` 的請求, 所以需要增加對此類請求的處理, 有兩種方式可以處理 `OPTIONS` 的請求.

- 可以對根 `Router` 添加 `empty_handler` ：

```rust
Router::with_hoop(cors).get(hello).options(handler::empty());
```

- 可以在 Catcher 上添加 `cors` 的 Handler:

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

_**示例代碼**_ 


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
