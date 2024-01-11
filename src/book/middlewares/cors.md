# CORS

CORS middleware can be used for [Cross-Origin Resource Sharing](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

Since the browser will send `Method::OPTIONS` requests, we need to increase the processing of such requests. We need to add middleware to `Service`..

_**Example**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>