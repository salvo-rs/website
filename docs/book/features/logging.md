# Logging

Middleware that provides basic Log functionality. If the middleware is added directly to `Router`, it will not be able to catch the 404 error returned when all `Router` does not match. It is recommended to add it to `Service`.

_**Example**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
