---
title: "Depot"
weight: 1050
menu:
  book:
    parent: "basics"
---


Depot is used to save data when process current request. It is useful for middlewares to share data.

For example, we can set ```current_user``` in ```auth_handler```, and then use this value in the following middlewares and handlers.

A depot instance created when server get a request from client. The depot will dropped when all process for this request done.