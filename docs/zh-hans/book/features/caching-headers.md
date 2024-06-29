# Caching Headers

提供对缓存头配置支持的中间件.

实际上实现内部包含了 `CachingHeaders`, `Modified`, `ETag` 三个 `Handler` 的实现, `CachingHeaders` 是后两者的组合. 正常情况下使用 `CachingHeaders`.

_**示例代码**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/caching-headers/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/caching-headers/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
