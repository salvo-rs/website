---
title: "Handle Error"
weight: 2032
menu:
  book:
    parent: "advanced"
---

在 Salvo 中, 錯誤處理的常規方式是自定義一個錯誤類型:

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

為這個自定義錯誤類型實現 ```Writer```:

```rust
#[async_trait]
impl Writer for Error {
    async fn write(mut self, _req: &mut Request, depot: &mut Depot, res: &mut Response) {
    }
}
```

在 ```write``` 方法中, 可以甚至可以對於不同的當前用戶展示不同的錯誤頁面, 比如, 對於管理員, 顯示完整的錯誤信息, 而對於普通用戶, 則展示非常簡單的錯誤信息.

有了這個自定義的錯誤類型後, 後面對於 ```fn_handler``` 的錯誤就會變得很簡單:

```rust
#[fn_handler]
async fn show_article(req: &mut Request, res: &mut Response) -> AppResult<()> {
    let id = req.get_param("id").unwrap_or_default();
    let article = articles::table.find(id).get_result::<Article>()?;
    res.render(Json(article));
    Ok(())
}
```