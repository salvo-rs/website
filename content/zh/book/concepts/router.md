---
title: "Router"
weight: 2005
menu:
  book:
    parent: "concepts"
---


```Router``` 中很多方法都是返回自己, 以便方便地实现链式写法. 有时会遇上在某些情况下需要根据条件判断才可以添加路由的情况. 路由也提供了一些方便的方法, 简化代码书写.

```Router```通过过滤器确定路由是否匹配. 过滤器支持逻辑运算 and or. 一个路由可以添加多个过滤器, 当所有添加的过滤器都匹配时, 路由匹配成功. 

需要说明的是, 网站的网址集合是一个树状结构, 这个结构并不等同于 ```Router``` 的树状结构. 网址的某个节点可能会对应于多个 ```Router```. 比如说, articles/ 路径下有些路径是需要登录的, 有些路径是无需登录的. 所以, 可以将同样有登录需求的放在一个 ```Router```下面, 并且在它们的顶层 ```Router``` 上添加验证中间件. 而另外不需要登录就能访问的放到另外一个没有验证中间件的路由下面:

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

Router 用于过滤请求, 然后将请求发送给不同的 Handler 处理.
最常用的过滤是 path 和 method. path 匹配路径信息; method 匹配请求的 Method.
过滤条件之间可以使用 and, or 连接, 比如:

```rust
Router::new().filter(filter::path("hello").and(filter::get()));
```

### Path 过滤器
Path 过滤器支持正则表达式匹配。
可以通过 <*rest> 或者 <**rest> 匹配所有剩余的路径。

### Method 过滤器