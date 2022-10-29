# Catcher

```Catcher``` 是用於處理頁面返回 HTTP 狀態碼為錯誤的情況下, 如何顯示頁面的抽象.

```rust
pub trait Catcher: Send + Sync + 'static {
    fn catch(&self, req: &Request, res: &mut Response) -> bool;
}
```

一個網站應用可以指定多個不同的 Catcher 對象處理錯誤. 它們被保存在 Service 的字段中:

```rust
pub struct Service {
    pub(crate) router: Arc<Router>,
    pub(crate) catchers: Arc<Vec<Box<dyn Catcher>>>,
    pub(crate) allowed_media_types: Arc<Vec<Mime>>,
}
```

可以通過 ```Server``` 的 ```with_catchers``` 函數設置它們:

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

當網站請求結果有錯誤時, 首先試圖通過用戶自己設置的 ```Catcher``` 設置錯誤頁面, 如果 ```Catcher``` 捕獲錯誤, 則返回 ```true```. 

如果您自己設置的 ```Catcher``` 都沒有捕獲這個錯誤, 則系統使用默認的 ```Catcher``` 實現 ```CatcherImpl``` 捕獲處理錯誤, 發送默認的錯誤頁面. 默認的錯誤實現 ```CatcherImpl``` 支持以 ```XML```, ```JSON```, ```HTML```, ```Text``` 格式發送錯誤頁面.