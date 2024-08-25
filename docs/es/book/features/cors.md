# CORS

El Intercambio de recursos entre Orígenes (CORS) puede ser usado por [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

Dado que el navegador enviará una solicitud `Method::OPTIONS`, es necesario aumentar el procesamiento de dichas solicitudes y agregar middleware a `Service`.

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
