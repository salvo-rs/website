---
title: "Writer"
weight: 250
menu:
  book:
    parent: "concepts"
---

Writer 用于写入内容到 Response:

```rust
#[async_trait]
pub trait Writer {
    async fn write(mut self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

相比于 Handler:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

他们直接的差别在于:
- 用途不一样, Writer 代表将具体的内容写入 Response, 由具体的内容实现, 比如字符串, 错误信息等. 而 Handler 是用于处理整个请求的.
- Writer 是在 Handler 中被创建, 会在 write 调用时消耗自身, 是一次性调用. 而 Handler 是所有请求公用的. 而 Handler 是
- Writer 可以作为 Handler 的返回的 Result 中的内容.