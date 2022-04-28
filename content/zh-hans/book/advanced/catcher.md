---
title: "Catcher"
weight: 2030
menu:
  book:
    parent: "advanced"
---

用于处理请求出错时的显示.

```rust
pub trait Catcher: Send + Sync + 'static {
    fn catch(&self, req: &Request, res: &mut Response) -> bool;
}
```

一个网站应用可以指定多个不同的 Catcher 对象处理错误. 它们被保存在 Service 的字段中:

```rust
pub struct Service {
    pub(crate) router: Arc<Router>,
    pub(crate) catchers: Arc<Vec<Box<dyn Catcher>>>,
    pub(crate) allowed_media_types: Arc<Vec<Mime>>,
}
```

可以通过 ```Server``` 的 ```with_catchers``` 函数设置它们.