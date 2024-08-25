# CORS

CORS middleware can be used for [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Since the browser will send a `Method::OPTIONS` request, it is necessary to increase the processing of such requests and add middleware to `Service`.

_**Example**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>