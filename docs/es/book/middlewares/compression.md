# compresión

El Middleware para el procesamiento de compresión del contenido de `Response`.

Provee soporte para tres formatos de compresión: `br`, `gzip`, `deflate`. Puedes configurar la prioridad de cada formato de compresión de acuerdo con tus necesidades.

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/compression/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/compression/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
