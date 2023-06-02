# CORS

CORS 中間件可以用於 [跨域資源共享](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS).

由於瀏覽器會發 `Method::OPTIONS` 的請求, 所以需要增加對此類請求的處理. 可以對根 `Router` 添加 `empty_handler` 一勞永逸地處理這種情況.

_**示例代碼**_ 


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cors/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cors/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>