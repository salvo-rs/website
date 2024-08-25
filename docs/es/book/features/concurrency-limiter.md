# Limitador de concurrencia

El middleware del limitador de concurrencia puede controlar la cantidad de solicitudes simultáneas. Para una API específica, [consulte la documentación] (https://docs.rs/salvo_extra/latest/salvo_extra/concurrency_limiter/index.html).

_**Código de muestra**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/concurrency-limiter/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code rust](../../../../codes/concurrency-limiter/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>