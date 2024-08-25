# Force HTTPS

`force-https` 中間件可以強製所有的請求轉嚮至使用 HTTPS 協議.

此中間價如果應用於 `Router` 則隻有在路由匹配到時才會強製轉換協議，如果遇到頁麵不存在的情況，則不會轉嚮.

但更常見的需求是期望任何的請求都自動轉嚮，即使在路由未能匹配，返回 `404` 錯誤時，這時候可以把中間件添加到 `Service` 上. 不管請求是否被路由成功匹配， `Service` 上添加的中間件總是會執行.

_**示例代碼**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/force-https/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code rust](../../../../codes/force-https/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>