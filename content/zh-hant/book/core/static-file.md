---
title: "靜態文件"
weight: 2060
menu:
  book:
    parent: "core"
---

Salvo 提供了 ```salvo::fs::NamedFile```, 可以用它發送文件高效地發送文件到客戶端:

```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
    NamedFile::send_file("/file/to/path", req, res).await;
}
```

