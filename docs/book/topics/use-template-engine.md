# Use Template Engine

Salvo doesn't have a templating engine built in; after all, the style of templating you like to use varies from person to person.

A template engine is essentially: data + template = string.

So, any template engine can be supported as long as it can render the final string.

For example, we can use `askama` like so:


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/template-askama/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code rust](../../../codes/template-askama/Cargo.toml)

  </CodeGroupItem>
  <CodeGroupItem title="template/hello.toml">

@[code rust](../../../codes/template-askama/templates/hello.html)

  </CodeGroupItem>
</CodeGroup>
