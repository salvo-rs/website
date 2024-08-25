# OpenAPI

OpenAPI 是一個開源的規範，用於描述 RESTful APIs 的接口設計. 它以 JSON 或 YAML 格式定義了 API 的請求和響應的結構、參數、返回類型、錯誤碼等細節，使得客戶端和服務端之間的通信更加明確和規範化.

OpenAPI 最初是 Swagger 規範的開源版本，現在已經成為了一個獨立的項目，並得到了許多大型企業和開發者的支持. 使用 OpenAPI 規範可以幫助開發團隊更好地協作，減少溝通成本，提高開發效率. 同時，OpenAPI 還為開發者提供了自動生成 API 文檔、Mock 數據和測試用例等工具，方便開發和測試工作.

Salvo 提供了 OpenAPI 的集成 (修改自 [utoipa](https://github.com/juhaku/utoipa)). salvo 依據自身特點，非常優雅地從 `Handler` 上自動獲取相關的 OpenAPI 數據類型信息. salvo 還集成 SwaggerUI, scalar, rapidodc, redoc 等幾個開源流行的 OpenAPI 界麵.

_**示例代碼**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

在瀏覽器裏麵輸入 `http://localhost:5800/swagger-ui` 就可以看到 Swagger UI 的頁麵.

Salvo 中的 OpenAPI 集成是相當優雅的，對於上麵的示例，相比於普通的 Salvo 項目，我們隻是做了以下幾步：

- 在 `Cargo.toml` 中開啓 `oapi` 功能: `salvo = { workspace = true, features = ["oapi"] }`;

- 把 `[handler]` 換成 `[endpoint]`;

- 使用 `name: QueryParam<String, false>` 獲取查詢字符串的值, 當你訪問網址 `http://localhost/hello?name=chris` 時, 這個 `name` 的查詢字符串就會被解析.  `QueryParam<String, false>` 這裏的 `false` 代錶這個參數是可以省略的, 如果訪問 `http://localhost/hello` 依然不會報錯.  相反, 如果是 `QueryParam<String, true>` 則代錶此參數是必須提供的, 否則返回錯誤. 

- 創建 `OpenAPI` 並且創建對應的 `Router`.  `OpenApi::new("test api", "0.0.1").merge_router(&router)` 這裏的 `merge_router` 錶示這個 `OpenAPI` 通過解析某個路由獲取它和它的子孫路由獲取必要的文檔信息.  某些路由的 `Handler` 可能冇有提供生成文檔的信息, 這些路由將被忽略, 比如使用 `#[handler]` 宏而非 `#[endpoint]` 宏定義的 `Handler`.  也就是說, 實際項目中, 為了開發進度等原因, 你可以選擇實現不生成 OpenAPI 文檔, 或者部分生成 OpenAPI 文檔.  後續可以逐步增加生成 OpenAPI 接口的數量, 而你需要做的也僅僅隻是把  `#[handler]` 改成 `#[endpoint]`, 以及修改函數簽名. 

## 數據提取器

通過 `use salvo::oapi::extract:*;`  可以導入預置的常用的數據提取器.  提取器會提供一些必要的信息給 Salvo, 以便 Salvo 生成 OpenAPI 的文檔. 

- `QueryParam<T, const REQUIRED: bool>`: 一個從查詢字符串提取數據的提取器.  `QueryParam<T, false>` 代錶此參數不是必須的, 可以省略.  `QueryParam<T, true>` 代錶此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `HeaderParam<T, const REQUIRED: bool>`: 一個從請求的頭部信息中提取數據的提取器.  `HeaderParam<T, false>` 代錶此參數不是必須的, 可以省略.  `HeaderParam<T, true>` 代錶此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `CookieParam<T, const REQUIRED: bool>`: 一個從請求的頭部信息中提取數據的提取器.  `CookieParam<T, false>` 代錶此參數不是必須的, 可以省略.  `CookieParam<T, true>` 代錶此參數是必須的, 不可以省略, 如果不提供, 則返回錯誤;

- `PathParam<T>`: 一個從請求 `URL` 中提取路徑參數的提取器.  此參數如果不存在, 路由匹配就是不成功, 因此不存在可以省略的情況;

- `FormBody<T>`: 從請求提交的錶單中提取信息;

- `JsonBody<T>`: 從請求提交的 JSON 格式的負載中提取信息;

## `#[endpoint]` 宏

在生成 OpenAPI 文檔時, 需要使用 `#[endpoint]` 宏代替常規的 `#[handler]` 宏, 它實際上是一個增強版本的 `#[handler]` 宏. 

- 它可以通過函數的簽名獲取生成 OpenAPI 所必須的信息;

- 對於不方便通過簽名提供的信息, 可以直接在 `#[endpoint]` 宏中添加屬性的方式提供, 通過這種方式提供的信息會於通過函數簽名獲取的信息合並, 如果存在沖突, 則會覆蓋函數簽名提供的信息. 

你可以使用 Rust 自帶的 `#[deprecated]` 屬性標註某個 Handler 已經過時被廢棄.  雖然 `#[deprecated]` 屬性支持添加諸如廢棄原因,版本等信息, 但是 OpenAPI 並不支持, 因此這些信息在生成 OpenAPI 時將會被忽略. 

代碼中的文檔註釋部分會自動被提取用於生成 OpenAPI, 第一行被用於生成 _`summary`_, 整個註釋部分會被用於生成 _`description`_. 

```rust
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[endpoint]
fn endpoint() {}
```

## ToSchema

可以使用 `#[derive(ToSchema)]` 定義數據結構:

```rust
#[derive(ToSchema)]
struct Pet {
    id: u64,
    name: String,
}
```

可以使用 `#[salvo(schema(...))]` 定義可選的設置:

- `example = ...` 可以是 `json!(...)`. `json!(...)` 會被 `serde_json::json!` 解析為`serde_json::Value`. 

  ```rust
  #[derive(ToSchema)]
  #[salvo(schema(example = json!({"name": "bob the cat", "id": 0})))]
  struct Pet {
      id: u64,
      name: String,
  }
  ```

- `xml(...)` 可以用於定義 Xml 對象屬性:

  ```rust
  #[derive(ToSchema)]
  struct Pet {
      id: u64,
      #[salvo(schema(xml(name = "pet_name", prefix = "u")))]
      name: String,
  }
  ```

## ToParameters

從結構體的字段生成 [路徑參數][path_params]. 

這是 [`ToParameters`][to_parameters] trait 的 `#[derive]` 實現. 

通常情況下，路徑參數需要在 `endpoint` 的 [`#[salvo_oapi::endpoint(...parameters(...))]`][path_params] 中定義. 但是當使用 [`struct`][struct] 來定義參數時，就可以省略上麵的步驟. 盡管如此，如果需要給出描述或更改默認配置，那麼 [`std::primitive`] 和 [`String`](std::string::String) 路徑參數或 [tuple] 風格的路徑參數還是需要在 `parameters(...)` 中定義. 

你可以使用 Rust 內置的 `#[deprecated]` 屬性標記字段為已棄用，它將反映到生成出來的 OpenAPI 規範中. 

`#[deprecated]` 屬性支持添加額外的信息比如棄用原因或者從某個版本開始棄用，但 OpenAPI 並不支持. OpenAPI 隻支持一個佈爾值來確定是否棄用. 雖然完全可以聲明一個帶原因的棄用，如 `#[deprecated  = "There is better way to do this"]`，但這個原因不會在 OpenAPI 規範中呈現. 

結構體字段上的註釋文檔會用作生成出來的 OpenAPI 規範中的參數描述. 

```rust
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Query {
    /// Query todo items by name.
    name: String
}
```

### ToParameters Container Attributes for `#[salvo(parameters(...))]`

以下屬性可以用在那些派生於 `ToParameters` 的結構體的容器屬性 `#[salvo(parameters(…))]`

- `names(...)` 為作為路徑參數使用的結構體的未命名字段定義逗號分隔的名稱列錶. 僅支持在未命名結構體上使用. 
- `style = ...` 可定義所有參數的序列化方式，由 [`ParameterStyle`][style] 指定. 默認值基於 _`parameter_in`_ 屬性. 
- `default_parameter_in = ...` 定義此字段的參數使用的默認位置，該位置的值來自於 [`parameter::ParameterIn`][in_enum]. 如果冇有提供此屬性，則默認來自 `query`. 
- `rename_all = ...` 可以作為 `serde` 的 `rename_all` 的替代方案. 實際上提供了相同的功能. 

使用 `names` 給單個未命名的參數定義名稱. 

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id")))]
struct Id(u64);
```

使用 `names` 給多個未命名的參數定義名稱. 

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id", "name")))]
struct IdAndName(u64, String);
```

### ToParameters Field Attributes for `#[salvo(parameter(...))]`

以下屬性可以在結構體字段上使用 `#[salvo(parameter(...))]`：

- `style = ...` 定義參數如何被 [`ParameterStyle`][style] 序列化. 默認值基於 _`parameter_in`_ 屬性.

- `parameter_in = ...` 使用來自 [`parameter::ParameterIn`][in_enum] 的值定義這個字段參數在哪裏. 如果冇有提供這個值，則默認來自 `query`. 

- `explode` 定義是否為每個在 _`object`_ 或 _`array`_ 中的參數創建新的 _`parameter=value`_ 對. 

- `allow_reserved` 定義參數值中是否允許出現保留字符 _`:/?#[]@!$&'()*+,;=`_. 

- `example = ...` 可以是方法的引用或 _`json!(...)`_. 給定的示例會覆蓋底層參數類型的任何示例. 

- `value_type = ...` 可被用於重寫 OpenAPI 規範中字段使用的默認類型. 在默認類型與實際類型不對應的情況下很有用，比如使用非 [`ToSchema`][to_schema] 或 [`primitive` types][primitive] 中定義的第三方類型時. 值可以是正常情況下可被序列化為 JSON 的任意 Rust 類型或如 _`Object`_._`Object`_ 這種會被渲染成通用 OpenAPI 對象的自定義類型. 

- `inline` 如果啓用，這個字段類型的定義必須來自 [`ToSchema`][to_schema]，且這個定義會被內聯. 

- `default = ...` 可以是方法引用或 _`json!(...)`_. 

- `format = ...` 可以是 [`KnownFormat`][known_format] 枚舉的變體，或者是字符串形式的開放值. 默認情況下，格式是根據屬性的類型根據 OpenApi 規範推導而來. 

- `write_only` 定義屬性僅用於**寫**操作 _POST,PUT,PATCH_ 而不是 _GET_. 

- `read_only` 定義屬性僅用於**讀**操作 _GET_ 而不是 _POST,PUT,PATCH_. 

- `nullable` 定義屬性是否可為 `null` （註意這與非必需不同）. 

- `required = ...` 用於強製要求參數必傳. [參見規則][derive@ToParameters#field-nullability-and-required-rules]. 

- `rename = ...` 可以作為 `serde` 的 `rename` 的替代方案. 實際上提供了相同的功能. 

- `multiple_of = ...` 用於定義值的倍數. 隻有當用這個關鍵字的值去除參數值，並且結果是一個整數時，參數值才被認為是有效的. 倍數值必須嚴格大於 _`0`_.

- `maximum = ...` 用於定義取值的上限，包含當前取值. 

- `minimum = ...` 用於定義取值的下限，包含當前取值. 

- `exclusive_maximum = ...` 用於定義取值的上限，不包含當前取值. 

- `exclusive_minimum = ...` 用於定義取值的下限，不包含當前取值. 

- `max_length = ...` 用於定義 `string` 類型取值的最大長度. Can be used to define maximum length for `string` types.

- `min_length = ...` 用於定義 `string` 類型取值的最小長度. Can be used to define minimum length for `string` types.

- `pattern = ...` 用於定義字段值必須匹配的有效的正則錶達式，正則錶達式採用 _ECMA-262_ 版本. 

- `max_items = ...` 可用於定義 `array` 類型字段允許的最大項數. 值必須是非負整數. 

- `min_items = ...` 可用於定義 `array` 類型字段允許的最小項數. 值必須是非負整數. 

- `with_schema = ...` 使用函數引用創建出的 _`schema`_ 而不是默認的 _`schema`_. 該函數必須滿足定義`fn() -> Into<RefOr<Schema>>`. 它不接收任何參數並且必須返回任何可以轉換為 `RefOr<Schema>` 的值. 

- `additional_properties = ...` 用於為 `map` 定義自由形式類型，比如 [`HashMap`]
(std::collections::HashMap) 和 [`BTreeMap`](std::collections::BTreeMap). 自由形式類型允許在映射值中使用任意類型. 支持的格式有 _`additional_properties`_ 和 _`additional_properties = true`_. 

#### Field nullability and required rules

一些應用於 _`ToParameters`_ 字段屬性的是否可為空和是否必需的規則同樣可用於 _`ToSchema`_ 字段屬性. [參見規則][`derive@ToSchema#field-nullability-and-required-rules`]. 

### Partial `#[serde(...)]` attributes support

ToParameters 派生目前支持部分 [serde 屬性]. 這些支持的屬性將反映到生成的 OpenAPI 文檔中. 目前支持以下屬性：

- `rename_all = "..."` 在容器級別支持. 
- `rename = "..."` **僅**在字段級別支持. 
- `default` 根據 [serde attributes] 在容器級和字段級支持. 
- `skip_serializing_if = "..."` **僅**在字段級別支持. 
- `with = ...` **僅**在字段級別支持. 
- `skip_serializing = "..."` **僅**在字段級或變體級支持. 
- `skip_deserializing = "..."` **僅**在字段級或變體級支持. 
- `skip = "..."` **僅**在字段級別支持. 

其他的 _`serde`_ 屬性將影響序列化，但不會反映在生成的 OpenAPI 文檔上. 

### 示例

_**演示使用 `#[salvo(parameters(...))]` 容器屬性結合 [`ToParameters`][to_parameters] 的用法，用在路徑參數上，並內聯一個查詢字段：**_

```rust
use serde::Deserialize;
use salvo_core::prelude::*;
use salvo_oapi::{ToParameters, ToSchema};

#[derive(Deserialize, ToSchema)]
#[serde(rename_all = "snake_case")]
enum PetKind {
    Dog,
    Cat,
}

#[derive(Deserialize, ToParameters)]
struct PetQuery {
    /// Name of pet
    name: Option<String>,
    /// Age of pet
    age: Option<i32>,
    /// Kind of pet
    #[salvo(parameter(inline))]
    kind: PetKind
}

#[salvo_oapi::endpoint(
    parameters(PetQuery),
    responses(
        (status_code = 200, description = "success response")
    )
)]
async fn get_pet(query: PetQuery) {
    // ...
}
```

_**使用 `value_type` 將 `String` 類型覆蓋為 `i64` 類型. **_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = i64))]
    id: String,
}
```

_**使用 `value_type` 將 `String` 類型覆蓋為 `Object` 類型. 在 OpenAPI 規範中，`Object` 類型會顯示成 `type:object`. **_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Object))]
    id: String,
}
```

_**你也可以用一個泛型來覆蓋字段的默認類型. **_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Option<String>))]
    id: String
}
```

_**你甚至可以用一個 [`Vec`] 覆蓋另一個 [`Vec`]. **_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Vec<i32>))]
    id: Vec<String>
}
```

_**我們可以用另一個 [`ToSchema`][to_schema] 來覆蓋字段類型. **_

```rust
# use salvo_oapi::{ToParameters, ToSchema};

#[derive(ToSchema)]
struct Id {
    value: i64,
}

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Id))]
    id: String
}
```

_**屬性值的校驗示例**_

```rust
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Item {
    #[salvo(parameter(maximum = 10, minimum = 5, multiple_of = 2.5))]
    id: i32,
    #[salvo(parameter(max_length = 10, min_length = 5, pattern = "[a-z]*"))]
    value: String,
    #[salvo(parameter(max_items = 5, min_items = 1))]
    items: Vec<String>,
}
```

_**使用 `schema_with` 為字段手動實現 schema. **_

```rust
# use salvo_oapi::schema::Object;
fn custom_type() -> Object {
    Object::new()
        .schema_type(salvo_oapi::SchemaType::String)
        .format(salvo_oapi::SchemaFormat::Custom(
            "email".to_string(),
        ))
        .description("this is the description")
}

#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Query {
    #[salvo(parameter(schema_with = custom_type))]
    email: String,
}
```

[to_schema]: trait.ToSchema.html
[known_format]: openapi/schema/enum.KnownFormat.html
[xml]: openapi/xml/struct.Xml.html
[to_parameters]: trait.ToParameters.html
[path_params]: attr.path.html#params-attributes
[struct]: https://doc.rust-lang.org/std/keyword.struct.html
[style]: openapi/path/enum.ParameterStyle.html
[in_enum]: salvo_oapi/openapi/path/enum.ParameterIn.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[serde attributes]: https://serde.rs/attributes.html

- `rename_all = ...`: 支持於 `serde` 類似的語法定義重命名字段的規則. 如果同時定義了 `#[serde(rename_all = "...")]` 和 `#[salvo(schema(rename_all = "..."))]`, 則優先使用 `#[serde(rename_all = "...")]`.

- `symbol = ...`: 一個字符串字麵量, 用於定義結構在 OpenAPI 中線上的名字路徑. 比如 `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: 可以使用結構體的 `Default` 實現來為所有字段填充默認值. 

### 錯誤處理方式

對於一般的應用, 我們會定義一個全局的錯誤類型 (AppError), 為 AppError 實現 `Writer` 或者 `Scribe`, 以便可以將錯誤作為網頁信息發送給客戶端.

而對於 OpenAPI, 我們為了能達到必要的錯誤信息, 我們還需要為這個錯誤實現 `EndpointOutRegister`:

```rust
use salvo::http::{StatusCode, StatusError};
use salvo::oapi::{self, EndpointOutRegister, ToSchema};

impl EndpointOutRegister for Error {
    fn register(components: &mut oapi::Components, operation: &mut oapi::Operation) {
        operation.responses.insert(
            StatusCode::INTERNAL_SERVER_ERROR.as_str(),
            oapi::Response::new("Internal server error").add_content("application/json", StatusError::to_schema(components)),
        );
        operation.responses.insert(
            StatusCode::NOT_FOUND.as_str(),
            oapi::Response::new("Not found").add_content("application/json", StatusError::to_schema(components)),
        );
        operation.responses.insert(
            StatusCode::BAD_REQUEST.as_str(),
            oapi::Response::new("Bad request").add_content("application/json", StatusError::to_schema(components)),
        );
    }
}
```

此錯誤集中定義了整個網頁應用可能返回的所有錯誤信息, 然而, 很多時候我們的 `Handler` 裏麵可能隻包含其中幾種具體錯誤類型, 此時可以使用 `status_codes` 過濾出需要的錯誤類型信息:

```rust
#[endpoint(status_codes(201, 409))]
pub async fn create_todo(new_todo: JsonBody<Todo>) -> Result<StatusCode, Error> {
    Ok(StatusCode::CREATED)
}
```
