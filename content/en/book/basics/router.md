---
title: "Router"
weight: 1020
menu:
  book:
    parent: "basics"
---

## What is router

Router can route http requests to different handlers. This is a basic and key feature in salvo.

## Write in flat way
We can wite routers in flat way, like this:

```rust
Router::with_path("writers").get(list_writers).post(create_writer);
Router::with_path("writers/<id>").get(show_writer).patch(edit_writer).delete(delete_writer);
Router::with_path("writers/<id>/articles").get(list_writer_articles);
```

## Write in tree way
We can write router like a tree:

```rust
Router::with_path("writers").get(list_writers).post(create_writer).push(
    Router::with_path("<id>")
        .get(show_writer)
        .patch(edit_writer)
        .delete(delete_writer)
        .push(Router::with_path("articles").get(list_writer_articles)),
);
```


## Get param in routers

In previous source code, ```<id>``` is a param definition. We can access it's value via Request instance:

```rust
#[fn_handler]
async fn show_writer(req: &mut Request) {
    let id = req.get_param::<i64>("id").unwrap();
}
```

```<id>``` matches a fragment in the path, under normal circumstances, the article ```id``` is just a number, which we can use regular expressions to restrict ```id``` matching rules, ```r"<id:/\d+/>"```.

For numeric characters there is an easier way to use ```<id:num>```, the specific writing is:
- ```<id:num>```, matches any number of numeric characters;
- ```<id:num[10]>```, only matches a certain number of numeric characters, where 10 means that the match only matches 10 numeric characters;
-```<id:num(..10)>``` means matching 1 to 9 numeric characters;
- ```<id:num(3..10)>``` means matching 3 to 9 numeric characters;
- ```<id:num(..=10)>``` means matching 1 to 10 numeric characters;
- ```<id:num(3..=10)>``` means match 3 to 10 numeric characters;
- ```<id:num(10..)>``` means to match at least 10 numeric characters.

You can also use ```<*>``` or ```<**>``` to match all remaining path fragments. In order to make the code more readable, you can also add appropriate name to make the path semantics more clear, for example: ```<**file_path>```.

It is allowed to combine multiple expressions to match the same path segment, such as ```/articles/article_<id:num>/```. 

## Add middlewares

Middleware can be added via ```hoop``` method.

```rust
Router::new()
    .hoop(check_authed)
    .path("writers")
    .get(list_writers)
    .post(create_writer)
    .push(
        Router::with_path("<id>")
            .get(show_writer)
            .patch(edit_writer)
            .delete(delete_writer)
            .push(Router::with_path("articles").get(list_writer_articles)),
    );
```

In this example, the root router has a middleware to check current user is authed. This middleware will affects root router and it's descendants.

If we don't want to check user is authed when current user view writer informations and articles. We can write router like this:

```rust
Router::new()
    .push(
        Router::new()
            .before(check_authed)
            .path("writers")
            .post(create_writer)
            .push(Router::with_path("<id>").patch(edit_writer).delete(delete_writer)),
    )
    .push(
        Router::new().path("writers").get(list_writers).push(
            Router::with_path("<id>")
                .get(show_writer)
                .push(Router::with_path("articles").get(list_writer_articles)),
        ),
    );
```

Although there are two routers have the same ```path("articles")```, they can still be added to the same parent route at the same time.

## Filters

Many methods in ```Router``` return to themselves in order to easily implement chain writing. Sometimes, in some cases, you need to judge based on conditions before you can add routing. Routing also provides some convenience Method, simplify code writing.

```Router``` uses the filter to determine whether the route matches. The filter supports logical operations and or. Multiple filters can be added to a route. When all the added filters match, the route is matched successfully.

It should be noted that the URL collection of the website is a tree structure, and this structure is not equivalent to the tree structure of ```Router```. A node of the URL may correspond to multiple ```Router```. For example, some paths under the articles/ path require login, and some paths do not require login. Therefore, you can put the same login requirements under a ```Router```, and on top of them Add authentication middleware on ```Router```. In addition, you can access it without logging in and put it under another route without authentication middleware:

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
Comming soon...