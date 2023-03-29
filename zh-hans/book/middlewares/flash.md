# Flash

提供 Flash Message 的功能的中间件.

`FlashStore` 提供对数据的存取操作. `CookieStore` 会在 `Cookie` 中存储数据. 而 `SessionStore` 把数据存储在 `Session` 中, `SessionStore` 必须和 `session` 功能一起使用.

## 示例代码

### Cookie 存储示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../../codes/flash-cookie-store/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../../codes/flash-cookie-store/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>


### Session 存储示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../../codes/flash-session-store/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../../codes/flash-session-store/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>