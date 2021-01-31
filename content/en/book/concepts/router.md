---
title: "Router"
weight: 20
menu:
  book:
    parent: "concepts"
---


handler 是一个trait，内部包含一个个异步方法，handle。但很多时候只是希望通过函数作为处理函数。可以添加fnhandle将普通函数转为处理函数。
处理函数默认签名包含三个参数，依次是，request，depot. response. depot 是一个临时存储，可以存储本次请求相关的数据。如果不需要，可以直接省略。另外一个可以省略的参数是 request.

