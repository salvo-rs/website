# CORS

CORS 中间件可以用于 [跨源资源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

由于浏览器会发 `Method::OPTIONS` 的请求, 所以需要增加对此类请求的处理. 可以对根 `Router` 添加 `empty_handler` 一劳永逸地处理这种情况.

_**示例代码**_ 


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
