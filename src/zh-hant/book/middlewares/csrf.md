# CSRF

提供 CSRF (Cross-Site Request Forgery) 保護的中間件. 

`Csrf` 是實現了 `Handler` 的結構體, 內部還有一個 `skipper` 字段, 可以指定跳過某些不需要驗證的請求. 默認情況下, 驗證 `Method::POST`, `Method::PATCH`, `Method::DELETE`, `Method::PUT` 請求.

 `CsrfStore` 提供對數據的存取操作. `CookieStore` 會在 `Cookie` 中存儲數據, 將根據用戶提交的 `csrf-token` 和 `Cookie` 值驗證請求的有效性. 而 `SessionStore` 把數據存儲在 `Session` 中, 用用戶提交的數據和 `Session` 中的數據驗證請求的有效性. 需要注意的是, `SessionStore` 必須和 `session` 中間件一起使用.

_**示例代碼**_ (cookie store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/csrf-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/csrf-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


_**Example**_ (session store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/csrf-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/csrf-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>