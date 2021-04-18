---
title: "Handler"
weight: 2010
menu:
  book:
    parent: "concepts"
---

Handler 是负责负责处理 Request 请求的具体对象.  Hander 本身是一个 Trait, 内部包含一个 ```handle``` 的异步方法:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

很多时候只是希望通过函数作为 ```Handler``` 处理请求. 可以添加 ```fn_handler``` 将普通函数转为 ```Handler```.

处理函数默认签名包含三个参数, 依次是, ```&mut Request, &mut Depot. &mut Response```. Depot 是一个临时存储, 可以存储本次请求相关的数据. 如果不需要, 可以直接省略. 省略的顺序是 Depot, Request, Response.

中间件其实也是 ```Handler```, 它们可以对请求到达正式处理请求的 ```Handler``` 之前或者之后作一些处理 比如：登录验证, 数据压缩等.

中间件是通过 ```Router``` 的 ```before``` 和 ```after``` 函数添加的. 被添加的中间件会影响当前的 ```Router``` 和它内部所有子孙 ```Router```.
