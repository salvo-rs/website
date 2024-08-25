# Logging

提供基本的 Log 功能的中间件. 如果中间件直接添加到了 `Router` 上，它将无法捕获所有 `Router` 都不匹配时返回的 404 错误，建议添加到 `Service` 上. 

_**示例代码**_ 


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>