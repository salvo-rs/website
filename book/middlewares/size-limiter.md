# Size Limiter

Provides middleware for requesting upload file size limits.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["size-limit"] }
```

## Sample Code

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../codes/size-limiter/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/size-limiter/Cargo.toml)

</CodeGroupItem>
</CodeGroup>