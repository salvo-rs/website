---
title: "Custom Path Part"
weight: 6110
menu:
  book:
    parent: "advanced"
---

For some frequently-occurring matching expressions, we can name a short name by ```PathFilter::register_part_regex``` or ```PathFilter::register_part_builder```. For example, GUID format is often used in paths appears, normally written like this every time a match is required:

```rust
Router::with_path("/articles/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA -F]{12}/>");
Router::with_path("/users/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA -F]{12}/>");
````

Writing this complex regular expression every time is prone to errors, and the code is not beautiful. You can do this:

```rust
use salvo::routing::filter::PathFilter;

#[tokio::main]
async fn main() {
    let guid = regex::Regex::new("[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA- F]{12}").unwrap();
    PathFilter::register_part_regex("guid", guid);
    Router::new()
        .push(Router::with_path("/articles/<id:guid>").get(show_article))
        .push(Router::with_path("/users/<id:guid>").get(show_user));
}
````

You only need to register once, and then you can directly match the GUID through the simple writing method such as ``<id:guid>```, which simplifies the writing of the code.