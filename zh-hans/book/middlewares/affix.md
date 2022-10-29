# Affix

Affix 中间件用于往 Depot 中添加共享数据.

## 配置 Cargo.toml

```toml
salvo = { version = "*", features = ["affix"] }
```

## 示例代码

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/affix/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/affix/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>