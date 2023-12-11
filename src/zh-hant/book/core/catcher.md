# Catcher

如果 `Response` 的狀態碼是錯誤, 而頁面裏面的 `Body` 是空, 這時 salvo 會試圖使用 `Catcher` 捕獲這個錯誤, 顯示一個友好的錯誤頁面.

可以通過 `Catcher::default()` 返回一個系統默認的 `Catcher`, 然後講它添加到 `Service` 上.

```rust
use salvo::catcher::Catcher;

Service::new(router).with_catcher(Catcher::default());
```

默認的 `Catcher` 支持以 `XML`, `JSON`, `HTML`, `Text` 格式發送錯誤頁面.

可以通過給這個默認的 `Catcher` 添加 `hoop` 的方式, 把自定義的錯誤捕獲程序添加到`Catcher`上. 這個錯誤捕獲的程序依然是 `Handler`.

你可以通過 `hoop` 爲 `Catcher` 添加多個自定義的錯誤捕獲程序。自定義的錯誤處理程序可以在處理錯誤後調用 `FlowCtrl::skip_next` 方法跳過後續錯誤程序，提前返回。

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>