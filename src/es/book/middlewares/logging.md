# Bitácora de Seguimiento

Provee una bitácora de seguimiento básica. Si el middleware es agregado directamente al `Router`, éste no podrá detectar un error y capturar el error 404 `Router`. Es recomendable agregar esto al servicio `Service`.

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
