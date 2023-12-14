# Depot

Depot 是用於保存一次請求中涉及到的臨時數據. 中間件可以將自己處理的臨時數據放入 Depot, 供後續程序使用.

當一個服務器接收到一個客戶瀏覽器發來的請求後會創建一個 ```Depot``` 的實例. 這個實例會在所有的中間件和 `Handler` 處理完請求後被銷燬.

比如說, 我們可以在登錄的中間件中設置 ```current_user```, 然後在後續的中間件或者 `Handler` 中讀取當前用戶信息.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/use-depot/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/use-depot/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## 通過 `insert` 和 `get` 設置和取出數據

 正如上面所示, 可以通過 `insert` 把 `key` 和 `value` 插入到 `Depot` 中. 對於這一類型的值, 直接用 `get` 取出.

```rust
depot.insert("a", "b");
assert_eq!(depot.get::<&str>("a").copied().unwrap(), "b")
```

 如果不存在這個 `key`, 或者 `key` 存在, 但是類型不匹配, 則返回 `None`.

## 通過 `inject` 和 `obtain` 設置和取出數據

有時, 存在一些不需要關係具體 `key`, 對於這種類型也存在唯一實例的情況. 可以使用 `inject` 插入數據, 然後使用 `obtain` 取出數據. 它們不需要你提供 `key`.

```rust
depot.inject(Config::new());
depot.obtain::<Config>();
```