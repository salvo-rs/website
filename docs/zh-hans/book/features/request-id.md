# Request Id

Request Id 中间件是比较灵活的，生成器(IdGenerator) 用于生成 ID, 可以定义自己的 ID 生成器，只要实现 `IdGenerator` 这个 trait. 默认提供生成器是 `UlidGenerator`. 

另外你可以控制是否覆盖现在的已经存在的 `requestid`. 还可以设置 `header_name` 等, 具体请[查看文档](https://docs.rs/salvo_extra/latest/salvo_extra/request_id/index.html).

_**示例代码**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>