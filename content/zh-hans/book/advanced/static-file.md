---
title: "静态文件"
weight: 2060
menu:
  book:
    parent: "advanced"
---

Salvo 提供了 ```salvo::fs::NamedFile```, 可以用它发送文件高效地发送文件到客户端:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::send_file("/file/to/path", req, res).await;
}
```

