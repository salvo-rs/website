---
title: "Handle Error"
weight: 2032
menu:
  book:
    parent: "advanced"
---

在 Salvo 中, 错误处理的常规方式是自定义一个错误类型:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("io: `{0}`")]
    Io(#[from] io::Error),
    #[error("utf8: `{0}`")]
    FromUtf8(#[from] FromUtf8Error),
    #[error("diesel: `{0}`")]
    Diesel(#[from] diesel::result::Error),
    ...
}

pub type AppResult<T> = Result<T, Error>;
```

为这个自定义错误类型实现 ```Writer```:

```rust
#[async_trait]
impl Writer for Error {
    async fn write(mut self, _req: &mut Request, depot: &mut Depot, res: &mut Response) {
    }
}
```

在 ```write``` 方法中, 可以甚至可以对于不同的当前用户展示不同的错误页面, 比如, 对于管理员, 显示完整的错误信息, 而对于普通用户, 则展示非常简单的错误信息.

有了这个自定义的错误类型后, 后面对于 ```fn_handler``` 的错误就会变得很简单:

```rust
#[fn_handler]
async fn show_article(req: &mut Request, res: &mut Response) -> AppResult<()> {
    let id = req.get_param("id").unwrap_or_default();
    let article = articles::table.find(id).get_result::<Article>()?;
    res.render(Json(article));
    Ok(())
}
```