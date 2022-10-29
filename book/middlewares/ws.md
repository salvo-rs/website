# WebSocket

Middleware that provides support for `WebSocket`.

## Config Cargo.toml

```toml
salvo = { version = "*", features = ["ws"] }
```

## Sample Code

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../codes/ws/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/ws/Cargo.toml)

</CodeGroupItem>
</CodeGroup>

### WebSocket Chat

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../codes/ws-chat/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code toml](../../codes/ws-chat/Cargo.toml)

</CodeGroupItem>
</CodeGroup>