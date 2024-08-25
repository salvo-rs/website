# Logging

提供基本的 Log 功能的中間件. 如果中間件直接添加到了 `Router` 上，它將無法捕獲所有 `Router` 都不匹配時返回的 404 錯誤，建議添加到 `Service` 上. 

_**示例代碼**_ 


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>