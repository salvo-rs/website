# Compression

對 `Response` 內容壓縮處理的中間件.

提供對三種壓縮格式的支持: `br`, `gzip`, `deflate`. 可以根據需求配置各個壓縮方式的優先度等.

## 示例代碼

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../../codes/compression/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../../codes/compression/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>