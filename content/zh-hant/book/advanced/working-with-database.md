---
title: "使用數據庫"
weight: 2080
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
    DB_POOL.get().unwrap().get()
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

fn main() {
    DB_POOL
        .set(build_pool(&DB_URL, 10).expect(&format!("Error connecting to {}", &DB_URL)))
        .ok();
}

#[handler]
async fn show_article(req: &mut Request, res: &mut Response) -> Result<(), Error> {
    let id = req.param::<i64>("id").unwrap_or_default();
    let conn = connect()?;
    let article = articles::table.find(id).first::<Article>(&conn)?;
    res.render(Json(row));
    Ok(())
}
```

### Sqlx

```rust
use sqlx::{Pool, PgPool};
use once_cell::sync::OnceCell;

pub static DB_POOL: OnceCell<PgPool> = OnceCell::new();

pub fn db_pool() -> &PgPool {
    DB_POOL.get().unwrap()
}

pub async fn make_db_pool(db_url: &str) -> PgPool {
    Pool::connect(&db_url).await.unwrap()
}

#[tokio::main]
async fn main() {
    let pool = make_db_pool().await;
    DB_POOL.set(pool).unwrap();
}
```