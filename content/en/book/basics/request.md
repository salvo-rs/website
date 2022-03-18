---
title: "Request"
linkTitle: "Request"
weight: 1030
menu:
  book:
    parent: "basics"
---

For web applications it’s crucial to react to the data a client sends to the server. In Salvo this information is provided by the request:

```rust
#[fn_handler]
async fn hello(req: &mut Request) -> String {
    req.get_param::<String>("id")
}
```

## About query string

We can get query string from request object:

```rust
req.get_query::<String>("id");
```

## About form


```rust
req.get_form::<String>("id").await;
```


## About json payload

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