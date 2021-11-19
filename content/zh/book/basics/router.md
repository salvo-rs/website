---
title: "Router"
weight: 2005
menu:
  book:
    parent: "concepts"
---

## 什么是 Router

```Router``` 定义了一个 HTTP 请求会被哪些中间件和 ```Handler``` 处理. 这个是 Salvo 里面最基础也是最核心的功能.

## 扁平式定义

我们可以用扁平式的风格定义路由:

```rust
Router::with_path("writers").get(list_writers).post(create_writer);
Router::with_path("writers/<id>").get(show_writer).patch(edit_writer).delete(delete_writer);
Router::with_path("writers/<id>/articles").get(list_writer_articles);
```

## 树状式定义

我们也可以把路由定义成树状, 这也是推荐的定义方式:

```rust
Router::with_path("writers").get(list_writers).post(create_writer).push(
    Router::with_path("<id>")
        .get(show_writer)
        .patch(edit_writer)
        .delete(delete_writer)
        .push(Router::with_path("articles").get(list_writer_articles)),
);
```

## 从路由中获取参数

在上面的代码中, ```<id>``` 定义了一个参数. 我们可以通过 ```Request``` 实例获取到它的值:

```rust
#[fn_handler]
async fn show_writer(req: &mut Request) {
    let id = req.get_param::<i64>("id").unwrap();
}
```

```<id>```匹配了路径中的一个片段, 正常情况下文章的 ```id``` 只是一个数字, 这是我们可以使用正则表达式限制 ```id``` 的匹配规则, ```r"<id:/\d+/>"```. 

对于这种数字类型, 还有一种更简单的方法是使用  ```<id:num>```, 具体写法为:
- ```<id:num>```， 匹配任意多个数字字符;
- ```<id:num[10]>```， 只匹配固定特定数量的数字字符，这里的 10 代表匹配仅仅匹配 10 个数字字符;
- ```<id:num(..10)>```, 代表匹配 1 到 9 个数字字符;
- ```<id:num(3..10)>```, 代表匹配 3 到 9 个数字字符;
- ```<id:num(..=10)>```, 代表匹配 1 到 10 个数字字符;
- ```<id:num(3..=10)>```, 代表匹配 3 到 10 个数字字符;
- ```<id:num(10..)>```, 代表匹配至少 10 个数字字符.

还可以通过 ```<*>``` 或者 ```<**>``` 匹配所有剩余的路径片段. 为了代码易读性性强些, 也可以添加适合的名字, 让路径语义更清晰, 比如: ```<**file_path>```.

允许组合使用多个表达式匹配同一个路径片段, 比如 ```/articles/article_<id:num>/```.

## 添加中间件

可以通过路由上的 ```hoop``` 函数添加中间件:

```rust
Router::new()
    .hoop(check_authed)
    .path("writers")
    .get(list_writers)
    .post(create_writer)
    .push(
        Router::with_path("<id>")
            .get(show_writer)
            .patch(edit_writer)
            .delete(delete_writer)
            .push(Router::with_path("articles").get(list_writer_articles)),
    );
```

在这个例子, 根路由使用 ```check_authed``` 检查当前用户是否已经登录了. 所有子孙路由都会受此中间件影响.

如果用户只是浏览 ```writer``` 的信息和文章, 我们更希望他们无需登录即可浏览. 我们可以把路由定义成这个样子:

```rust
Router::new()
    .push(
        Router::new()
            .before(check_authed)
            .path("writers")
            .post(create_writer)
            .push(Router::with_path("<id>").patch(edit_writer).delete(delete_writer)),
    )
    .push(
        Router::new().path("writers").get(list_writers).push(
            Router::with_path("<id>")
                .get(show_writer)
                .push(Router::with_path("articles").get(list_writer_articles)),
        ),
    );
```

尽管有两个路由都有相同的路径定义 ```path("articles")```, 他们依然可以被添加到同一个父路由里.

## 过滤器

在 ```Router``` 中有许多方法调用后会返回自己, 以便于链式书写代码. 有时候, 你需要根据某些条件决定如何路由, 路由系统也提供了一些判断的方式, 也很容易使用.
