---
title: "Routing System"
linkTitle: "Routing System"
weight: 1020
menu:
  book:
    parent: "quick-start"
---
---

Normally we write routing like this：

```rust
Router::new().path("articles").get(list_articles).post(create_article);
Router::new()
    .path("articles/<id>")
    .get(show_article)
    .patch(edit_article)
    .delete(delete_article);
```

Often viewing articles and article lists does not require user login, but creating, editing, deleting articles, etc. require user login authentication permissions. The tree-like routing system in Salvo can meet this demand. We can write routers without user login together: 

```rust
Router::new()
    .path("articles")
    .get(list_articles)
    .push(Router::new().path("<id>").get(show_article));
```

Then write the routers that require the user to login together, and use the corresponding middleware to verify whether the user is logged in: 
```rust
Router::new()
    .path("articles")
    .before(auth_check)
    .post(list_articles)
    .push(Router::new().path("<id>").patch(edit_article).delete(delete_article));
```

Although these two routes have the same ```path("articles")```, they can still be added to the same parent route at the same time, so the final route looks like this: 

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
