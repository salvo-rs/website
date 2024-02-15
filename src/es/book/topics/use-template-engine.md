# Usar motor de plantillas

Salvo no tiene un motor de plantillas incorporado; después de todo, el estilo de plantillas que te gusta usar varía de persona a persona.

Un motor de plantillas es esencialmente: datos + plantilla = cadena.

Por lo tanto, se puede admitir cualquier motor de plantilla siempre que pueda representar la cadena final.

Por ejemplo, podemos usar `askama` así:


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/template-askama/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code rust](../../../../codes/template-askama/Cargo.toml)

  </CodeGroupItem>
  <CodeGroupItem title="template/hello.toml">

@[code rust](../../../../codes/template-askama/templates/hello.html)

  </CodeGroupItem>
</CodeGroup>
