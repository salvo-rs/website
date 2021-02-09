---
title: "Middleware"
weight: 90
menu:
  book:
    parent: "concepts"
---

Middleware is handler, they can be used to process the request before or after the request handled by actual handler. For example: user auth, compress the responsed data.



中间件是通过 before 和 after添加到router上面。被添加的中间件会影响router和它内部所有子孙 routers.
需要说明的是，网站的网址集合是一个树状结构，这个结构并不等同于router的树状结构。网址的某个节点可能会对应于多个router。比如说，users/ 路径下有些路径是需要登录的，有些路径是无需登录的。所以，可以将同样有登录需求的放在一个router下面，并且在它们的顶层router上添加验证中间件。而另外不需要登录就能访问的放到另外一个没有验证中间件的路由下面。

路由中很多方法都是返回自己，以便方便地实现链式写法。有时会遇上在某些情况下需要根据条件判断才可以添加路由的情况。路由也提供了一些方便的方法，简化代码书写。

路由通过过滤器确定路由是否匹配。过滤器支持逻辑运算 and or. 一个路由可以添加多个过滤器，当所有添加的过滤器都匹配时，路由匹配成功。