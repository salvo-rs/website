# Flash

Éste Middleware provee soporte a la funcionalidad de Flash Message.

El `FlashStore` provee acceso a los datos. `CookieStore` almacena los datos en `Cookie`. Mientras que `SessionStore` almacena los datos en `Session`, `SessionStore` tiene que ser usado con `session`.

_**Ejemplo**_

## Usando almacenamiento en cookie (cookie store)

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/flash-cookie-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/flash-cookie-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


## Usando almacenamiento de la sesión (session store)s

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/flash-session-store/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/flash-session-store/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
