# CORS

CORS middleware can be used for [Cross-Origin Resource Sharing](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

Since the browser will send `Method::OPTIONS` requests, it is necessary to increase the handling of such requests. You can add `empty_handler` to the root `Router` to handle this situation once and for all.

## Example

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>