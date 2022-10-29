# CSRF

提供 CSRF (Cross-Site Request Forgery) 保护的中间件. 

## 主要功能

* `CsrfStore` 提供对数据的存取操作. `CookieStore` 会在 `Cookie` 中存储数据, 将根据用户提交的 `csrf-token` 和 `Cookie` 值验证请求的有效性. 而 `SessionStore` 把数据存储在 `Session` 中, 用用户提交的数据和 `Session` 中的数据验证请求的有效性. 需要注意的是, `SessionStore` 必须和 `session` 功能一起使用.

* `Csrf` 是实现了 `Handler` 的结构体, 内部还有一个 `skipper` 字段, 可以指定跳过某些不需要验证的请求. 默认情况下, 验证 `Method::POST`, `Method::PATCH`, `Method::DELETE`, `Method::PUT` 请求.

## 配置 Cargo.toml

```toml
salvo = { version = "*", features = ["csrf"] }
```

## 示例代码

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/csrf-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/csrf-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


## Sample Code(session store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/csrf-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/csrf-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>