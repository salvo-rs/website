# Compression

Middleware for `Response` content compression processing.

Provides support for three compression formats: `br`, `gzip`, `deflate`. You can configure the priority of each compression method according to your needs.

## Example

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../codes/compression/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../codes/compression/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>