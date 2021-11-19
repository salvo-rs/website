---
title: "路由系统"
weight: 1020
menu:
  book:
    parent: "quick-start"
---

Salvo 采用树状的路由系统，可以很方便地对不同的节点添加中间件；也可以很方便低写出链式的代码，而无需声明变量.

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
    .before(auth_check)
    .post(list_articles)
    .push(Router::new().path("<id>").patch(edit_article).delete(delete_article));
```

虽然这两个路由都有这同样的 ```path("articles")```, 然而它们依然可以被同时添加到同一个父路由, 所以最后的路由长成了这个样子:

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
            .before(auth_check)
            .post(list_articles)
            .push(Router::new().path("<id>").patch(edit_article).delete(delete_article)),
    );
```

```<id>```匹配了路径中的一个片段, 正常情况下文章的 ```id``` 只是一个数字, 这是我们可以使用正则表达式限制 ```id``` 的匹配规则, ```r"<id:/\d+/>"```. 

对于这种数字类型, 还有一种更简单的方法是使用  ```<id:num>```, 具体写法为:
- ```<id:num>```， 匹配任意多个数字字符;
- ```<id:num[10]>```， 只匹配固定特定数量的数字字符，这里的 10 代表匹配仅仅匹配 10 个数字字符;
- ```<id:num(..10)>``` 代表匹配 1 到 9 个数字字符;
- ```<id:num(3..10)>``` 代表匹配 3 到 9 个数字字符;
- ```<id:num(..=10)>``` 代表匹配 1 到 10 个数字字符;
- ```<id:num(3..=10)>``` 代表匹配 3 到 10 个数字字符;
- ```<id:num(10..)>``` 代表匹配至少 10 个数字字符.

还可以通过 ```<*>``` 或者 ```<**>``` 匹配所有剩余的路径片段. 为了代码易读性性强些, 也可以添加适合的名字, 让路径语义更清晰, 比如: ```<**file_path>```.

允许组合使用多个表达式匹配同一个路径片段, 比如 ```/articles/article_<id:num>/```.