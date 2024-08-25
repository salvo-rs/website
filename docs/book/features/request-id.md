# Request Id

Request Id middleware is flexible. The generator (IdGenerator) is used to generate IDs. You can define your own ID generator as long as you implement the `IdGenerator` trait. The default generator provided is `UlidGenerator`.

In addition, you can control whether to overwrite the existing `requestid`. You can also set `header_name`, etc. For details, please [see the document](https://docs.rs/salvo_extra/latest/salvo_extra/request_id/index.html).

_**Sample code**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/request-id/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/request-id/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>