# Caching Headers

提供對緩存頭配置支持的中間件.

實際上實現內部包含了 `CachingHeaders`, `Modified`, `ETag` 三個 `Handler` 的實現, `CachingHeaders` 是後兩者的組合. 正常情況下使用 `CachingHeaders`.

## 示例代碼

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/caching-headers/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/caching-headers/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
