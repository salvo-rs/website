---
title: "Routing System"
linkTitle: "Routing System"
weight: 5
menu:
  book:
    parent: "quick-start"
---
---

In previous section, we created a simple hello world example. Maybe we want to say hello to somebody. When you typed ```http://localhost:7878/Chris``` then the server response "Hello Chris!".

```rust
use salvo::prelude::*;

#[fn_handler]
async fn hello_world(req: &mut Request, res: &mut Response) {
    let name = res.get_param::<String>("name").unwrap_or("World".into());
    res.render_plain_text(&format!("Hello {}!", name));
}

#[tokio::main]
async fn main() {
    let router = Router::new().path("<name>").get(hello_world);
    let server = Server::new(router);
    server.bind(([0, 0, 0, 0], 7878)).await;
}
```

In this source code, we use get_param function defined in Request to get the ```name``` param user typed in browser.

```rust
let name = res.get_param::<String>("name").unwrap_or("World".into());
```

We also add a path filter to Router, this path filter will catch the first url segment in url can named it as ```name```.

```rust
let router = Router::new().path("<name>").get(hello_world);
```

In many web applications, they use ```id``` as params. Id always number, we can use regex to constraint it, like this:

```rust
let router = Router::new().path(r"<id:/\d+/>").get(hello_world);
```

Salvo use Tree-like routing system. You constructed your routers as a tree. Each node is a router and you can attach handler to these routers. You can also add middlewares before or after request routed to the actual handler. Middlewares added in router will affected itself and it's descendants.

```rust
use salvo::prelude::*;

#[tokio::main]
async fn main() {
    let debug_mode = true;
    let admin_mode = true;
    let router = Router::new()
        .get(index)
        .push(
            Router::new()
                .path("users")
                .before(auth)
                .post(create_user)
                .push(Router::new().path("<id:/\\d+/>").post(update_user).delete(delete_user)),
        )
        .push(
            Router::new()
                .path("users")
                .get(list_users)
                .push(Router::new().path("<id:/\\d+/>").get(show_user)),
        ).push_when(|_|if debug_mode {
            Some(Router::new().path("debug").get(debug))
        } else {
            None
        }).visit(|parent|{
            if admin_mode {
                parent.push(Router::new().path("admin").get(admin))
            } else {
                parent
            }
        });

    Server::new(router).bind(([0, 0, 0, 0], 7878)).await;
}
````