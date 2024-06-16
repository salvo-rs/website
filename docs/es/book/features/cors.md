# CORS

El Intercambio de recursos entre Orígenes (CORS) puede ser usado por [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Los navegadores modernos pueden bloquear las peticiones a diferentes dominios a menos que el dominio tenga habilitado el CORS. Éste middleware puede agregar la propiedad en las cabeceras para permitir peticiones desde dominios específico (Puedes permitir múltiples dominios con la instancia de la función [`AllowOrigin::list`]).

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

[`AllowOrigin::list`]: https://docs.rs/salvo-cors/0.64.0/salvo_cors/struct.AllowOrigin.html#method.list
