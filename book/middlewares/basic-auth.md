# Basic Auth

Middleware that provides support for Basic Auth.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["basic-auth"] }
```

## Sample Code

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../codes/basic-auth/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/basic-auth/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>