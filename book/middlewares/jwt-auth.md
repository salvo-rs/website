# JWT Auth

Provides middleware for JWT Auth authentication.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["jwt-auth"] }
```

## Sample Code

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../codes/jwt-auth/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/jwt-auth/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>