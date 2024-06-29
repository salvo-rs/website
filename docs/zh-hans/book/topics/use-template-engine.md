# 使用模板引擎

Salvo 没有内置任何模板引擎, 毕竟, 喜欢使用那种风格的模板引擎, 因人而异.

模板引擎本质上就是: 数据 + 模板 = 字符串.

所以, 只要能渲染最终的字符串就可以支持任意的模板引擎.

比如对 `askama` 的支持:


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
