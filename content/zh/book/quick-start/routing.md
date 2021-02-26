---
title: "路由系统"
weight: 2
menu:
  book:
    parent: "quick-start"
---

Salvo 采用树状的路由系统，可以很方便地对不同的节点添加中间件；也可以很方便低写出链式的代码，而无需声明变量.

```rust
let router = Router::new()
        .get(index)
        .push(
            Router::new()
                .path("users")
                .before(auth)
                .post(create_user)
                .push(Router::new().path(r"<id:/\d+/>").post(update_user).delete(delete_user)),
        )
        .push(
            Router::new()
                .path("users")
                .get(list_users)
                .push(Router::new().path(r"<id:/\d+/>").get(show_user)),
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
```

完整的例子可以从这里查看.

在这个例子中，有两个 ```Router::new().path("users")``` 被添加到了父级路由中，原因是对于这两个相同路径的路由，他们需要添加的中间件不同，一个需要验证用户登录，而另一个则是公开的，无需登录。