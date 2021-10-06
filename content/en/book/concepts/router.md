---
title: "Router"
weight: 2005
menu:
  book:
    parent: "concepts"
---

Many methods in ```Router``` return to themselves in order to easily implement chain writing. Sometimes, in some cases, you need to judge based on conditions before you can add routing. Routing also provides some convenience Method, simplify code writing.

```Router``` uses the filter to determine whether the route matches. The filter supports logical operations and or. Multiple filters can be added to a route. When all the added filters match, the route is matched successfully.

It should be noted that the URL collection of the website is a tree structure, and this structure is not equivalent to the tree structure of ```Router```. A node of the URL may correspond to multiple ```Router```. For example, some paths under the articles/ path require login, and some paths do not require login. Therefore, you can put the same login requirements under a ```Router```, and on top of them` Add authentication middleware on ```Router```. In addition, you can access it without logging in and put it under another route without authentication middleware:

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

Router is used to filter requests, and then send the requests to different Handlers for processing.
The most commonly used filtering is path and method.path matches path information; method matches the requested Method.
You can use and, or to connect between filter conditions, for example:

```rust
Router::new().filter(filter::path("hello").and(filter::get()));
```

### Path filter
The Path filter supports regular expression matching.
You can use <*rest> or <**rest> to match all remaining paths.

### Method filter