---
title: "自定义 Path Part"
weight: 6110
menu:
  book:
    parent: "advanced"
---

对于某些经常出现的匹配表达式, 我们可以通过 ```PathFilter::register_part_regex``` 或者 ```PathFilter::register_part_builder``` 命名一个简短的名称. 举例来说, GUID 格式在路径中经常出现, 正常写法是每次需要匹配时都这样:

```rust
Router::with_path("/articles/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
Router::with_path("/users/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
```

每次这么都要写这复杂的正则表达式会很容易出错, 代码也不美观, 可以这么做:

```rust
use salvo::routing::filter::PathFilter;

#[tokio::main]
async fn main() {
    let guid = regex::Regex::new("[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}").unwrap();
    PathFilter::register_part_regex("guid", guid);
    Router::new()
        .push(Router::with_path("/articles/<id:guid>").get(show_article))
        .push(Router::with_path("/users/<id:guid>").get(show_user));
}
```

仅仅只需要注册一次, 以后就可以直接通过 ```<id:guid>``` 这样的简单写法匹配 GUID, 简化代码的书写.