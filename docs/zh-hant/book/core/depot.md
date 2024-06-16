# Depot

Depot 是用來儲存一次請求中相關的臨時數據。中間件可以將其處理的臨時數據存入 Depot，以便後續的程序調用。

當伺服器接收到來自客戶端瀏覽器的請求時，會創建一個 `Depot` 實例。該實例會在所有中間件和 `Handler` 完成請求處理後被銷毀。

例如，我們可以在用戶認證的中間件中設置 `current_user`，隨後在後面的中間件或 `Handler` 中讀取當前用戶的資訊。

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/use-depot/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/use-depot/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## 通過 `insert` 和 `get` 設置和取出數據

 正如前文提到的，您可以使用 `insert` 方法將 `key` 與對應的 `value` 加入至 `Depot`。對於這類型的值，可以直接透過 `get` 方法來取得。

```rust
depot.insert("a", "b");
assert_eq!(depot.get::<&str>("a").copied().unwrap(), "b")
```

 如果該 `key` 不存在，或者 `key` 雖存在但類型不匹配，則會返回 `None`。

## 通過 `inject` 和 `obtain` 設置和取出數據

在某些情況下，可能會遇到不需要具體 `key` 並且對應類型有唯一實例的場景。在這種情況下，可以使用 `inject` 方法來插入數據，接著利用 `obtain` 方法來提取數據，這過程中無需提供 `key`。
```rust
depot.inject(Config::new());
depot.obtain::<Config>();
```