# Request Id

Request Id 中間件是比較靈活的，生成器(IdGenerator) 用於生成 ID, 可以定義自己的 ID 生成器，隻要實現 `IdGenerator` 這個 trait. 默認提供生成器是 `UlidGenerator`. 

另外你可以控製是否覆蓋現在的已經存在的 `requestid`. 還可以設置 `header_name` 等, 具體請[查看文檔](https://docs.rs/salvo_extra/latest/salvo_extra/request_id/index.html).

_**示例代碼**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/logging/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/logging/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>