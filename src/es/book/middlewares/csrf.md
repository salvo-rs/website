# CSRF

El middleware provee soporte a protección de CSRF (Cross-Site Request Forgery).

El `Csrf` es una estructura que implementa `Handler`, y es un campo dentro de `skipper`, que se puede especificar para omitir ciertas solicitudes que no requieren autenticación. Por defecto, `Method::POST`, `Method: :PATCH`, `Method::DELETE`, `Method::PUT` se encuentran incorporados.

El `CsrfStore` provee acceso a los datos. `CookieStore` almacenará los datos en la cookie `Cookie`, y verificará la validez de la solicitud de acuerdo con las `csrf-token` y `Cookie` con los valores suministrados por el usuario. Los datos son almacenados en la `Session`, y se verifica la validez de la solicitud con los datos presentados por el usuario y los datos de la `Session`. Note que `SessionStore` tiene que serusado con la función `session`.

_**Ejemplo**_ (Almacenamiento en cookie)

## Usando almacenamiento en cookie (cookie store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/csrf-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/csrf-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


## Usando almacenamiento de la sesión (session store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/csrf-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/csrf-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
