# OpenAPI

OpenAPI 是一個開源的規範，用於描述 RESTful APIs 的接口設計。它以 JSON 或 YAML 格式定義了 API 的請求和響應的結構、參數、返回類型、錯誤碼等細節，使得客戶端和服務端之間的通信更加明確和規範化。

OpenAPI 最初是 Swagger 規範的開源版本，現在已經成爲了一個獨立的項目，並得到了許多大型企業和開發者的支持。使用 OpenAPI 規範可以幫助開發團隊更好地協作，減少溝通成本，提高開發效率。同時，OpenAPI 還爲開發者提供了自動生成 API 文檔、Mock 數據和測試用例等工具，方便開發和測試工作。

Salvo 提供了 OpenAPI 的集成 (修改自 [utoipa](https://github.com/juhaku/utoipa)).

_**示例代碼**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

在瀏覽器裏面輸入 `http://localhost:5800/swagger-ui` 就可以看到 Swagger UI 的頁面.


Salvo 中的 OpenAPI 集成是相當優雅的，對於上面的示例，相比於普通的 Salvo 項目，我們只是做了以下幾步：

- 在 `Cargo.toml` 中開啓 `oapi` 功能: `salvo = { workspace = true, features = ["oapi"] }`;

- 把 `[handler]` 換成 `[endpoint]`;

- 使用 `name: QueryParam<String, false>` 獲取查詢字符串的值, 當你訪問網址 `http://localhost/hello?name=chris` 時, 這個 `name` 的查詢字符串就會被解析. `QueryParam<String, false>` 這裏的 `false` 代表這個參數是可以省略的, 如果訪問 `http://localhost/hello` 依然不會報錯. 相反, 如果是 `QueryParam<String, true>` 則代表此參數是必須提供的, 否則返回錯誤.

- 創建 `OpenAPI` 並且創建對應的 `Router`. `OpenApi::new("test api", "0.0.1").merge_router(&router)` 這裏的 `merge_router` 表示這個 `OpenApi` 通過解析某個路由獲取它和它的子孫路由獲取必要的文檔信息. 某些路由的 `Handler` 可能沒有提供生成文檔的信息, 這些路由將被忽略, 比如使用 `#[handler]` 宏而非 `#[endpoint]` 宏定義的 `Handler`. 也就是說, 實際項目中, 爲了開發進度等原因, 你可以選擇實現不生成 OpenAPI 文檔, 或者部分生成 OpenAPI 文檔. 後續可以逐步增加生成 OpenAPI 接口的數量, 而你需要做的也僅僅只是把  `#[handler]` 改成 `#[endpoint]`, 以及修改函數簽名.


## 數據提取器

通過 `use salvo::oapi::extract:*;`  可以導入預置的常用的數據提取器. 提取器會提供一些必要的信息給 Salvo, 以便 Salvo 生成 OpenAPI 的文檔.

- `QueryParam<T, const REQUIRED: bool>`: 一個從查詢字符串提取數據的提取器. `QueryParam<T, false>` 代表此參數不是必須的, 可以省略. `QueryParam<T, true>` 代表此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `HeaderParam<T, const REQUIRED: bool>`: 一個從請求的頭部信息中提取數據的提取器. `HeaderParam<T, false>` 代表此參數不是必須的, 可以省略. `HeaderParam<T, true>` 代表此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `CookieParam<T, const REQUIRED: bool>`: 一個從請求的頭部信息中提取數據的提取器. `CookieParam<T, false>` 代表此參數不是必須的, 可以省略. `CookieParam<T, true>` 代表此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `PathParam<T>`: 一個從請求 `URL` 中提取路徑參數的提取器. 此參數如果不存在, 路由匹配就是不成功, 因此不存在可以省略的情況;

- `FormBody<T>`: 從請求提交的表單中提取信息;

- `JsonBody<T>`: 從請求提交的 JSON 格式的負載中提取信息;


## `#[endpoint]` 宏

在生成 OpenAPI 文檔時, 需要使用 `#[endpoint]` 宏代替常規的 `#[handler]` 宏, 它實際上是一個增強版本的 `#[handler]` 宏. 

- 它可以通過函數的簽名獲取生成 OpenAPI 所必須的信息;

- 對於不方便通過簽名提供的信息, 可以直接在 `#[endpoint]` 宏中添加屬性的方式提供, 通過這種方式提供的信息會於通過函數簽名獲取的信息合併, 如果存在衝突, 則會覆蓋函數簽名提供的信息.

你可以使用 Rust 自帶的 `#[deprecated]` 屬性標註某個 Handler 已經過時被廢棄. 雖然 `#[deprecated]` 屬性支持添加諸如廢棄原因,版本等信息, 但是 OpenAPI 並不支持, 因此這些信息在生成 OpenAPI 時將會被忽略.

代碼中的文檔註釋部分會自動被提取用於生成 OpenAPI, 第一行被用於生成 _`summary`_, 整個註釋部分會被用於生成 _`description`_.

```rust
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[endpoint]
fn endpoint() {}
```
