# Compression

对 `Response` 内容压缩处理的中间件.

提供对三种压缩格式的支持: `br`, `gzip`, `deflate`. 可以根据需求配置各个压缩方式的优先度等.

## 示例代码

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../../codes/compression/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../../codes/compression/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>