---
title: "Handle Error"
weight: 2032
menu:
  book:
    parent: "advanced"
---

In Salvo, the normal way of error handling is to define a custom error type:

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

Implement ```Writer``` for this custom error type:

```rust
#[async_trait]
impl Writer for Error {
    async fn write(mut self, _req: &mut Request, depot: &mut Depot, res: &mut Response) {
    }
}
```

In the ```write``` method, you can even display different error pages for different current users, for example, for administrators, display the full error message, and for normal users, display a very simple error message.

With this custom error type, handle errors for ```handler``` become very simple:

```rust
#[handler]
async fn show_article(req: &mut Request, res: &mut Response) -> AppResult<()> {
    let id = req.param("id").unwrap_or_default();
    let article = articles::table.find(id).get_result::<Article>()?;
    res.render(Json(article));
    Ok(())
}
```