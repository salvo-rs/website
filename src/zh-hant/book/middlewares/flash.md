# Flash

提供 Flash Message 的功能的中間件.

`FlashStore` 提供對數據的存取操作. `CookieStore` 會在 `Cookie` 中存儲數據. 而 `SessionStore` 把數據存儲在 `Session` 中, `SessionStore` 必須和 `session` 功能一起使用.

## 示例代碼

### Cookie 存儲示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/flash-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/flash-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### Session 存儲示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/flash-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/flash-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>