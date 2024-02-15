# Caché en Cabeceras

Es el  Middleware que provee soporte a caché para la configuración de cabeceras.

En efecto, la implementación contiene tres implementaciones de `Handler` de `CachingHeaders`, `Modified`, `ETag`, y `CachingHeaders` es una combinación de las últimas dos. Normalmente, es usado `CachingHeaders`.

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/caching-headers/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/caching-headers/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
