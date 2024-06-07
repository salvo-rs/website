# CORS

CORS middleware can be used for [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Modern browsers will block requests to a different domain unless that domain has CORS enabled. This middleware will add the appropriate headers to allow CORS requests from specified domains (You can allow multiple domains with [`AllowOrigin::list`] instance function).

_**Example**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

[`AllowOrigin::list`]: https://docs.rs/salvo-cors/0.64.0/salvo_cors/struct.AllowOrigin.html#method.list
