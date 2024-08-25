# 欲练此功

## 为什么要写这个框架

当时，作为初学者，我发现我很笨，无法学会使用 actix-web，Rocket 等现存的框架. 当我想把以前的 Go 的 Web 服务使用 Rust 实现时，一眼看去，似乎每个框架都比 Go 里现存的框架复杂, 本来 Rust 的学习曲线就够陡峭的了, 又何苦把 Web 框架整得那么复杂?

在 Tokio 推出 Axum 框架时，我很开心地以为，我以后可以不必再维护一个自己的 Web 框架了. 然而，事实情况是我发现 Axum 看似简单，实际使用过程中过多的类型体操和泛型定义，必须是在对 Rust 语言有深度了解和不厌其烦地写出大量晦涩难懂的模板代码才能能完成一个简单中间件.

所以我决定继续维护我这个比较特别（顺手,功能丰富且适合初学者）的 Web 框架.

## Salvo(赛风) 是否适合你

Salvo 虽然简单, 但是功能足够全面强大, 基本可以认为是 Rust 界最强的, 然而, 就是这么强大的系统, 实际上学习和使用都是很简单的. 绝对不会让你有任何挥刀自宫的痛苦.

- 它适合刚刚在学习 Rust 的初级入门者, CRUD 应该是极其平常且常用的功能, 如果使用 Salvo 做类似的工作, 你会发现它和你使用过的其他语言的 Web 框架一样的简单 (比如: Express, Koa, gin, flask...), 甚至在某些方面更抽象简洁;

- 它适合希望将 Rust 用于生产环境, 提供给稳健快速的服务器. 虽然 Salvo 并未发布 1.0 版本, 但是, 它的核心功能已经经过几年的迭代, 足够稳定, 且问题修复及时;

- 它适合毛发已经不再茂密但是还每天不停掉发的你.

## 如何做到足够简单

很多底层的实现 Hyper 都已经实现，所以，一般需求，基于 Hyper 实现应该没有错. Salvo 也是一样. 核心功能是一个功能强大并且灵活的路由系统以及很多常用的功能, 比如 Acme, OpenAPI, JWT Auth 等.

Salvo 里统一了 Handler 和 Middleware. Middleware 就是 Handler. 通过路由的 hoop 添加到 Router 上. 本质上, Middleware 和 Handler 都是处理 Request 请求，并且可能向 Response 写入数据. 而 Handler 接收的参数是 Request, Depot, Response 三个, 其中 Depot 用于存储请求处理过程中的临时数据. 

为方便书写, 在用不着的情况下可以省略掉某些参数, 也可以无视参数的传入顺序.

```rust
use salvo::prelude::*;

#[handler]
async fn hello_world(_req: &mut Request, _depot: &mut Depot, res: &mut Response) {
    res.render("Hello world");
}
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("Hello world");
}
```

另外路由系统提供的 API 也是极其简单的, 但是, 功能却是强大的. 正常使用需求下, 基本上就是只关注 Router 一个类型即可.

## 路由系统

我自己感觉路由系统是跟其他的框架不太一样的. Router 可以写平，也可以写成树状.这里区业务逻辑树与访问目录树.业务逻辑树是根据业务逻辑需求，划分 router 结构，形成 router 树，它不一定与访问目录树一致.

正常情况下我们是这样写路由的：

```rust
Router::new().path("articles").get(list_articles).post(create_article);
Router::new()
    .path("articles/<id>")
    .get(show_article)
    .patch(edit_article)
    .delete(delete_article);
```

往往查看文章和文章列表是不需要用户登录的, 但是创建, 编辑, 删除文章等需要用户登录认证权限才可以. Salvo 中支持嵌套的路由系统可以很好地满足这种需求. 我们可以把不需要用户登录的路由写到一起：

```rust
Router::new()
    .path("articles")
    .get(list_articles)
    .push(Router::new().path("<id>").get(show_article));
```

然后把需要用户登录的路由写到一起， 并且使用相应的中间件验证用户是否登录：
```rust
Router::new()
    .path("articles")
    .hoop(auth_check)
    .post(list_articles)
    .push(Router::new().path("<id>").patch(edit_article).delete(delete_article));
```

虽然这两个路由都有这同样的 `path("articles")`, 然而它们依然可以被同时添加到同一个父路由, 所以最后的路由长成了这个样子:

```rust
Router::new()
    .push(
        Router::new()
            .path("articles")
            .get(list_articles)
            .push(Router::new().path("<id>").get(show_article)),
    )
    .push(
        Router::new()
            .path("articles")
            .hoop(auth_check)
            .post(list_articles)
            .push(Router::new().path("<id>").patch(edit_article).delete(delete_article)),
    );
```

`<id>` 匹配了路径中的一个片段, 正常情况下文章的 `id` 只是一个数字, 这是我们可以使用正则表达式限制 `id` 的匹配规则, `r"<id:/\d+/>"`.