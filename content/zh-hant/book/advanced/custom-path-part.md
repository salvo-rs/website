---
title: "自定義 Path Part"
weight: 6110
menu:
  book:
    parent: "advanced"
---

對於某些經常出現的匹配表達式, 我們可以通過 ```PathFilter::register_part_regex``` 或者 ```PathFilter::register_part_builder``` 命名一個簡短的名稱. 舉例來說, GUID 格式在路徑中經常出現, 正常寫法是每次需要匹配時都這樣:

```rust
Router::with_path("/articles/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
Router::with_path("/users/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
```

每次這麽都要寫這復雜的正則表達式會很容易出錯, 代碼也不美觀, 可以這麽做:

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

僅僅只需要註冊一次, 以後就可以直接通過 ```<id:guid>``` 這樣的簡單寫法匹配 GUID, 簡化代碼的書寫.