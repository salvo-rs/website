# JWT Auth

提供对 JWT Auth 验证的中间件.

## 配置 Cargo.toml

```toml
salvo = { version = "*", features = ["jwt-auth"] }
```

## 示例代码

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/jwt-auth/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/jwt-auth/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>