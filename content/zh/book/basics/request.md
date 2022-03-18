---
title: "Request"
linkTitle: "Request"
weight: 1030
menu:
  book:
    parent: "basics"
---

在 Salvo 中可以通过 ```Request``` 获取用户请求的数据:

```rust
#[fn_handler]
async fn hello(req: &mut Request) -> String {
    req.get_param::<String>("id")
}
```

## 获取查询参数

可以通过 ```get_query``` 获取查询参数:

```rust
req.get_query::<String>("id");
```

## 获取 Form 数据

可以通过 ```get_form``` 获取查询参数, 此函数为异步函数:

```rust
req.get_form::<String>("id").await;
```


## 获取 JSON 反序列化数据

```rust
req.read::<User>().await;
```

## File uploading

```rust
#[fn_handler]
async fn upload(req: &mut Request, res: &mut Response) {
    let file = req.get_file("file").await;
    if let Some(file) = file {
        let dest = format!("temp/{}", file.file_name().unwrap_or_else(|| "file".into()));
        println!("{}", dest);
        if let Err(e) = std::fs::copy(&file.path(), Path::new(&dest)) {
            res.set_status_code(StatusCode::INTERNAL_SERVER_ERROR);
            res.render(format!("file not found in request: {}", e.to_string()));
        } else {
            res.render(format!("File uploaded to {}", dest));
        }
    } else {
        res.set_status_code(StatusCode::BAD_REQUEST);
        res.render("file not found in request");
    }
}
```