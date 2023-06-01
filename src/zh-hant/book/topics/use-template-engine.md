# 使用模板引擎

Salvo 沒有內置任何模板引擎, 畢竟, 喜歡使用那種風格的模板引擎, 因人而異.

模板引擎本質上就是: 數據 + 模板 = 字符串.

所以, 只要能渲染最終的字符串就可以支持任意的模板引擎.

比如對 `askama` 的支持:


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
