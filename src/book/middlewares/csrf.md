# CSRF

Middleware that provides CSRF (Cross-Site Request Forgery) protection.

* `CsrfStore` provides access to data. `CookieStore` will store data in `Cookie`, and will verify the validity of the request according to the `csrf-token` and `Cookie` values submitted by the user. The data is stored in the `Session`, and the validity of the request is verified with the data submitted by the user and the data in the `Session`. Note that the `SessionStore` must be used with the `session` function.

* `Csrf` is a structure that implements `Handler`, and there is a `skipper` field inside, which can be specified to skip certain requests that do not require authentication. By default, `Method::POST`, `Method: :PATCH`, `Method::DELETE`, `Method::PUT` requests.

_**Example**_ 

### Use cookie store

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/csrf-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/csrf-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### Use session store

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/csrf-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/csrf-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>