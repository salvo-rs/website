# OpenAPI

OpenAPI 是一個開源的規範，用於描述 RESTful APIs 的接口設計.它以 JSON 或 YAML 格式定義了 API 的請求和響應的結構、參數、返回類型、錯誤碼等細節，使得客戶端和服務端之間的通信更加明確和規範化.

OpenAPI 最初是 Swagger 規範的開源版本，現在已經成爲了一個獨立的項目，並得到了許多大型企業和開發者的支持.使用 OpenAPI 規範可以幫助開發團隊更好地協作，減少溝通成本，提高開發效率.同時，OpenAPI 還爲開發者提供了自動生成 API 文檔、Mock 數據和測試用例等工具，方便開發和測試工作.

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

- 創建 `OpenAPI` 並且創建對應的 `Router`. `OpenApi::new("test api", "0.0.1").merge_router(&router)` 這裏的 `merge_router` 表示這個 `OpenAPI` 通過解析某個路由獲取它和它的子孫路由獲取必要的文檔信息. 某些路由的 `Handler` 可能沒有提供生成文檔的信息, 這些路由將被忽略, 比如使用 `#[handler]` 宏而非 `#[endpoint]` 宏定義的 `Handler`. 也就是說, 實際項目中, 爲了開發進度等原因, 你可以選擇實現不生成 OpenAPI 文檔, 或者部分生成 OpenAPI 文檔. 後續可以逐步增加生成 OpenAPI 接口的數量, 而你需要做的也僅僅只是把  `#[handler]` 改成 `#[endpoint]`, 以及修改函數簽名.


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


  - `example = ...` 可以是 `json!(...)`. `json!(...)` 會被 `serde_json::json!` 解析爲`serde_json::Value`.

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

Generate [path parameters][path_params] from struct's fields.

This is `#[derive]` implementation for [`ToParameters`][to_parameters] trait.

Typically path parameters need to be defined within [`#[salvo_oapi::endpoint(...parameters(...))]`][path_params] section
for the endpoint. But this trait eliminates the need for that when [`struct`][struct]s are used to define parameters.
Still [`std::primitive`] and [`String`](std::string::String) path parameters or [`tuple`] style path parameters need to be defined
within `parameters(...)` section if description or other than default configuration need to be given.

You can use the Rust's own `#[deprecated]` attribute on field to mark it as
deprecated and it will reflect to the generated OpenAPI spec.

`#[deprecated]` attribute supports adding additional details such as a reason and or since version
but this is is not supported in OpenAPI. OpenAPI has only a boolean flag to determine deprecation.
While it is totally okay to declare deprecated with reason
`#[deprecated  = "There is better way to do this"]` the reason would not render in OpenAPI spec.

Doc comment on struct fields will be used as description for the generated parameters.
```
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Query {
    /// Query todo items by name.
    name: String
}
```

### ToParameters Container Attributes for `#[salvo(parameters(...))]`

The following attributes are available for use in on the container attribute `#[salvo(parameters(...))]` for the struct
deriving `ToParameters`:

* `names(...)` Define comma separated list of names for unnamed fields of struct used as a path parameter.
   __Only__ supported on __unnamed structs__.
* `style = ...` Defines how all parameters are serialized by [`ParameterStyle`][style]. Default
   values are based on _`parameter_in`_ attribute.
* `default_parameter_in = ...` =  Defines default where the parameters of this field are used with a value from
   [`parameter::ParameterIn`][in_enum]. If this attribute is not supplied, then the default value is from query.
* `rename_all = ...` Can be provided to alternatively to the serde's `rename_all` attribute. Effectively provides same functionality.

Use `names` to define name for single unnamed argument.
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id")))]
struct Id(u64);
```

Use `names` to define names for multiple unnamed arguments.
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id", "name")))]
struct IdAndName(u64, String);
```

### ToParameters Field Attributes for `#[salvo(parameter(...))]`

The following attributes are available for use in the `#[salvo(parameter(...))]` on struct fields:

* `style = ...` Defines how the parameter is serialized by [`ParameterStyle`][style]. Default values are based on _`parameter_in`_ attribute.

* `parameter_in = ...` =  Defines where the parameters of this field are used with a value from
   [`parameter::ParameterIn`][in_enum]. If this attribute is not supplied, then the default value is from query.

* `explode` Defines whether new _`parameter=value`_ pair is created for each parameter within _`object`_ or _`array`_.

* `allow_reserved` Defines whether reserved characters _`:/?#[]@!$&'()*+,;=`_ is allowed within value.

* `example = ...` Can be method reference or _`json!(...)`_. Given example
  will override any example in underlying parameter type.

* `value_type = ...` Can be used to override default type derived from type of the field used in OpenAPI spec.
  This is useful in cases where the default type does not correspond to the actual type e.g. when
  any third-party types are used which are not [`ToSchema`][to_schema]s nor [`primitive` types][primitive].
   Value can be any Rust type what normally could be used to serialize to JSON or custom type such as _`Object`_.
   _`Object`_ will be rendered as generic OpenAPI object.

* `inline` If set, the schema for this field's type needs to be a [`ToSchema`][to_schema], and
  the schema definition will be inlined.

* `default = ...` Can be method reference or _`json!(...)`_.

* `format = ...` May either be variant of the [`KnownFormat`][known_format] enum, or otherwise
  an open value as a string. By default the format is derived from the type of the property
  according OpenApi spec.

* `write_only` Defines property is only used in **write** operations *POST,PUT,PATCH* but not in *GET*

* `read_only` Defines property is only used in **read** operations *GET* but not in *POST,PUT,PATCH*

* `nullable` Defines property is nullable (note this is different to non-required).

* `required = ...` Can be used to enforce required status for the parameter. [See
   rules][derive@ToParameters#field-nullability-and-required-rules]

* `rename = ...` Can be provided to alternatively to the serde's `rename` attribute. Effectively provides same functionality.

* `multiple_of = ...` Can be used to define multiplier for a value. Value is considered valid
  division will result an `integer`. Value must be strictly above _`0`_.

* `maximum = ...` Can be used to define inclusive upper bound to a `number` value.

* `minimum = ...` Can be used to define inclusive lower bound to a `number` value.

* `exclusive_maximum = ...` Can be used to define exclusive upper bound to a `number` value.

* `exclusive_minimum = ...` Can be used to define exclusive lower bound to a `number` value.

* `max_length = ...` Can be used to define maximum length for `string` types.

* `min_length = ...` Can be used to define minimum length for `string` types.

* `pattern = ...` Can be used to define valid regular expression in _ECMA-262_ dialect the field value must match.

* `max_items = ...` Can be used to define maximum items allowed for `array` fields. Value must
  be non-negative integer.

* `min_items = ...` Can be used to define minimum items allowed for `array` fields. Value must
  be non-negative integer.

* `with_schema = ...` Use _`schema`_ created by provided function reference instead of the
  default derived _`schema`_. The function must match to `fn() -> Into<RefOr<Schema>>`. It does
  not accept arguments and must return anything that can be converted into `RefOr<Schema>`.

* `additional_properties = ...` Can be used to define free form types for maps such as
  [`HashMap`](std::collections::HashMap) and [`BTreeMap`](std::collections::BTreeMap).
  Free form type enables use of arbitrary types within map values.
  Supports formats _`additional_properties`_ and _`additional_properties = true`_.

##### Field nullability and required rules

Same rules for nullability and required status apply for _`ToParameters`_ field attributes as for
_`ToSchema`_ field attributes. [See the rules][`derive@ToSchema#field-nullability-and-required-rules`].

### Partial `#[serde(...)]` attributes support

ToParameters derive has partial support for [serde attributes]. These supported attributes will reflect to the
generated OpenAPI doc. The following attributes are currently supported:

* `rename_all = "..."` Supported at the container level.
* `rename = "..."` Supported **only** at the field level.
* `default` Supported at the container level and field level according to [serde attributes].
* `skip_serializing_if = "..."` Supported  **only** at the field level.
* `with = ...` Supported **only** at field level.
* `skip_serializing = "..."` Supported  **only** at the field or variant level.
* `skip_deserializing = "..."` Supported  **only** at the field or variant level.
* `skip = "..."` Supported  **only** at the field level.

Other _`serde`_ attributes will impact the serialization but will not be reflected on the generated OpenAPI doc.

### Examples

_**Demonstrate [`ToParameters`][to_parameters] usage with the `#[salvo(parameters(...))]` container attribute to
be used as a path query, and inlining a schema query field:**_

```
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

_**Override `String` with `i64` using `value_type` attribute.**_
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = i64))]
    id: String,
}
```

_**Override `String` with `Object` using `value_type` attribute. _`Object`_ will render as `type: object` in OpenAPI spec.**_
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Object))]
    id: String,
}
```

_**You can use a generic type to override the default type of the field.**_
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Option<String>))]
    id: String
}
```

_**You can even override a [`Vec`] with another one.**_
```
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Vec<i32>))]
    id: Vec<String>
}
```

_**We can override value with another [`ToSchema`][to_schema].**_
```
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

_**Example with validation attributes.**_
```
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Item {
    #[salvo(parameter(maximum = 10, minimum = 5, multiple_of = 2.5))]
    id: i32,
    #[salvo(parameter(max_length = 10, min_length = 5, pattern = "[a-z]*"))]
    value: String,
    #[salvo(parameter(max_items = 5, min_items = 1))]
    items: Vec<String>,
}
````

_**Use `schema_with` to manually implement schema for a field.**_
```
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

- `symbol = ...`: 一個字符串字面量, 用於定義結構在 OpenAPI 中線上的名字路徑. 比如 `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: Can be used to populate default values on all fields using the struct’s Default implementation.


### 錯誤處理方式

對於一般的應用, 我們會定義一個全局的錯誤類型 (AppError), 爲 AppError 實現 `Writer` 或者 `Scribe`, 以便可以將錯誤作爲網頁信息發送給客戶端.

而對於 OpenAPI, 我們爲了能達到必要的錯誤信息, 我們還需要爲這個錯誤實現 `EndpointOutRegister`:

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

此錯誤集中定義了整個網頁應用可能返回的所有錯誤信息, 然而, 很多時候我們的 `Handler` 裏面可能只包含其中幾種具體錯誤類型, 此時可以使用 `status_codes` 過濾出需要的錯誤類型信息:

```rust
#[endpoint(status_codes(201, 409))]
pub async fn create_todo(new_todo: JsonBody<Todo>) -> Result<StatusCode, Error> {
    Ok(StatusCode::CREATED)
}
```