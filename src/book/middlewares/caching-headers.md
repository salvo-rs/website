# Caching Headers

Middleware that provides support for cache header configuration.

In fact, the implementation contains three `Handler` implementations of `CachingHeaders`, `Modified`, `ETag`, and `CachingHeaders` is a combination of the latter two. Normally, `CachingHeaders` is used.

_**Example**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/caching-headers/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/caching-headers/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
