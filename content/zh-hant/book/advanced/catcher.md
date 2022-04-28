---
title: "Catcher"
weight: 2030
menu:
  book:
    parent: "advanced"
---

用於處理請求出錯時的顯示.

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

可以通過 ```Server``` 的 ```with_catchers``` 函數設置它們.