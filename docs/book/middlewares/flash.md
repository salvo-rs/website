# Flash

Middleware that provides the functionality of Flash Message.

`FlashStore` provides access to data. `CookieStore` stores data in `Cookie`. While `SessionStore` stores data in `Session`, `SessionStore` must be used with the `session` middleware.

_**Example**_

## Use cookie store

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/flash-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/flash-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


## Use session store

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/flash-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/flash-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
