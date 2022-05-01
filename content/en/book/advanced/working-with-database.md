---
title: "Working with database"
weight: 6030
menu:
  book:
    parent: "advanced"
---

### Diesel

```rust
use diesel::prelude::*;
use diesel::r2d2::{ConnectionManager, Pool, PoolError, PooledConnection};
use once_cell::sync::OnceCell;
use salvo::prelude::*;

const DB_URL: &str = "postgres://benchmarkdbuser:benchmarkdbpass@tfb-database/hello_world";
type PgPool = Pool<ConnectionManager<PgConnection>>;

static DB_POOL: OnceCell<PgPool> = OnceCell::new();

fn connect() -> Result<PooledConnection<ConnectionManager<PgConnection>>, PoolError> {
    unsafe { DB_POOL.get_unchecked().get() }
}
fn build_pool(database_url: &str, size: u32) -> Result<PgPool, PoolError> {
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    diesel::r2d2::Pool::builder()
        .max_size(size)
        .min_idle(Some(size))
        .test_on_check_out(false)
        .idle_timeout(None)
        .max_lifetime(None)
        .build(manager)
}

#[fn_handler]
async fn show_article(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let id = req.get_param::<i64>("id").unwrap_or_default();
    let conn = connect()?;
    let article = articles::table.find(id).first::<Article>(&conn)?;
    res.render(Json(row));
    Ok(())
}
```