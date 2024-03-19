# Catcher

當 `Response` 的狀態碼為錯誤，且頁面中的 `Body` 為空時，salvo 會嘗試使用 `Catcher` 來捕捉此錯誤，並展示一個友善的錯誤提示頁面。

您可以透過 `Catcher::default()` 獲取系統預設的 `Catcher`，並將其加入至 `Service` 中。


```rust
use salvo::catcher::Catcher;

Service::new(router).catcher(Catcher::default());
```

預設的 `Catcher` 支援以 `XML`、`JSON`、`HTML`、`Text` 等格式來回應錯誤訊息。

您還可以透過為預設的 `Catcher` 加入 `hoop`，來新增自訂的錯誤處理函式至 `Catcher`。這些自訂的錯誤處理函式本質上仍是 `Handler`。

您可利用 `hoop` 為 `Catcher` 增添多個自訂的錯誤捕捉處理器。這些自訂的錯誤處理器能在處置錯誤後，呼叫 `FlowCtrl::skip_next` 方法以跳過餘下的錯誤處理流程，從而提前結束處理。
<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
