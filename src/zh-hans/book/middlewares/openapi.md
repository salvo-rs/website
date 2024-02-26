# OpenAPI

OpenAPI 是一个开源的规范，用于描述 RESTful APIs 的接口设计。它以 JSON 或 YAML 格式定义了 API 的请求和响应的结构、参数、返回类型、错误码等细节，使得客户端和服务端之间的通信更加明确和规范化。

OpenAPI 最初是 Swagger 规范的开源版本，现在已经成为了一个独立的项目，并得到了许多大型企业和开发者的支持。使用 OpenAPI 规范可以帮助开发团队更好地协作，减少沟通成本，提高开发效率。同时，OpenAPI 还为开发者提供了自动生成 API 文档、Mock 数据和测试用例等工具，方便开发和测试工作。

Salvo 提供了 OpenAPI 的集成 (修改自 [utoipa](https://github.com/juhaku/utoipa))。

_**示例代码**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

在浏览器里面输入 `http://localhost:5800/swagger-ui` 就可以看到 Swagger UI 的页面。

Salvo 中的 OpenAPI 集成是相当优雅的，对于上面的示例，相比于普通的 Salvo 项目，我们只是做了以下几步：

- 在 `Cargo.toml` 中开启 `oapi` 功能: `salvo = { workspace = true, features = ["oapi"] }`;

- 把 `[handler]` 换成 `[endpoint]`;

- 使用 `name: QueryParam<String, false>` 获取查询字符串的值, 当你访问网址 `http://localhost/hello?name=chris` 时, 这个 `name` 的查询字符串就会被解析。 `QueryParam<String, false>` 这里的 `false` 代表这个参数是可以省略的, 如果访问 `http://localhost/hello` 依然不会报错。 相反, 如果是 `QueryParam<String, true>` 则代表此参数是必须提供的, 否则返回错误。

- 创建 `OpenAPI` 并且创建对应的 `Router`。 `OpenApi::new("test api", "0.0.1").merge_router(&router)` 这里的 `merge_router` 表示这个 `OpenAPI` 通过解析某个路由获取它和它的子孙路由获取必要的文档信息。 某些路由的 `Handler` 可能没有提供生成文档的信息, 这些路由将被忽略, 比如使用 `#[handler]` 宏而非 `#[endpoint]` 宏定义的 `Handler`。 也就是说, 实际项目中, 为了开发进度等原因, 你可以选择实现不生成 OpenAPI 文档, 或者部分生成 OpenAPI 文档。 后续可以逐步增加生成 OpenAPI 接口的数量, 而你需要做的也仅仅只是把  `#[handler]` 改成 `#[endpoint]`, 以及修改函数签名。

## 数据提取器

通过 `use salvo::oapi::extract:*;`  可以导入预置的常用的数据提取器。 提取器会提供一些必要的信息给 Salvo, 以便 Salvo 生成 OpenAPI 的文档。

- `QueryParam<T, const REQUIRED: bool>`: 一个从查询字符串提取数据的提取器。 `QueryParam<T, false>` 代表此参数不是必须的, 可以省略。 `QueryParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `HeaderParam<T, const REQUIRED: bool>`: 一个从请求的头部信息中提取数据的提取器。 `HeaderParam<T, false>` 代表此参数不是必须的, 可以省略。 `HeaderParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `CookieParam<T, const REQUIRED: bool>`: 一个从请求的头部信息中提取数据的提取器。 `CookieParam<T, false>` 代表此参数不是必须的, 可以省略。 `CookieParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `PathParam<T>`: 一个从请求 `URL` 中提取路径参数的提取器。 此参数如果不存在, 路由匹配就是不成功, 因此不存在可以省略的情况;

- `FormBody<T>`: 从请求提交的表单中提取信息;

- `JsonBody<T>`: 从请求提交的 JSON 格式的负载中提取信息;

## `#[endpoint]` 宏

在生成 OpenAPI 文档时, 需要使用 `#[endpoint]` 宏代替常规的 `#[handler]` 宏, 它实际上是一个增强版本的 `#[handler]` 宏。

- 它可以通过函数的签名获取生成 OpenAPI 所必须的信息;

- 对于不方便通过签名提供的信息, 可以直接在 `#[endpoint]` 宏中添加属性的方式提供, 通过这种方式提供的信息会于通过函数签名获取的信息合并, 如果存在冲突, 则会覆盖函数签名提供的信息。

你可以使用 Rust 自带的 `#[deprecated]` 属性标注某个 Handler 已经过时被废弃。 虽然 `#[deprecated]` 属性支持添加诸如废弃原因,版本等信息, 但是 OpenAPI 并不支持, 因此这些信息在生成 OpenAPI 时将会被忽略。

代码中的文档注释部分会自动被提取用于生成 OpenAPI, 第一行被用于生成 _`summary`_, 整个注释部分会被用于生成 _`description`_。

```rust
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[endpoint]
fn endpoint() {}
```

## ToSchema

可以使用 `#[derive(ToSchema)]` 定义数据结构:

```rust
#[derive(ToSchema)]
struct Pet {
    id: u64,
    name: String,
}
```

可以使用 `#[salvo(schema(...))]` 定义可选的设置:

- `example = ...` 可以是 `json!(...)`. `json!(...)` 会被 `serde_json::json!` 解析为`serde_json::Value`。

  ```rust
  #[derive(ToSchema)]
  #[salvo(schema(example = json!({"name": "bob the cat", "id": 0})))]
  struct Pet {
      id: u64,
      name: String,
  }
  ```

- `xml(...)` 可以用于定义 Xml 对象属性:

  ```rust
  #[derive(ToSchema)]
  struct Pet {
      id: u64,
      #[salvo(schema(xml(name = "pet_name", prefix = "u")))]
      name: String,
  }
  ```

## ToParameters

从结构体的字段生成 [路径参数][path_params]。

这是 [`ToParameters`][to_parameters] trait 的 `#[derive]` 实现。

通常情况下，路径参数需要在 `endpoint` 的 [`#[salvo_oapi::endpoint(...parameters(...))]`][path_params] 中定义。但是当使用 [`struct`][struct] 来定义参数时，就可以省略上面的步骤。尽管如此，如果需要给出描述或更改默认配置，那么 [`std::primitive`] 和 [`String`](std::string::String) 路径参数或 [tuple] 风格的路径参数还是需要在 `parameters(...)` 中定义。

你可以使用 Rust 内置的 `#[deprecated]` 属性标记字段为已弃用，它将反映到生成出来的 OpenAPI 规范中。

`#[deprecated]` 属性支持添加额外的信息比如弃用原因或者从某个版本开始弃用，但 OpenAPI 并不支持。OpenAPI 只支持一个布尔值来确定是否弃用。虽然完全可以声明一个带原因的弃用，如 `#[deprecated  = "There is better way to do this"]`，但这个原因不会在 OpenAPI 规范中呈现。

结构体字段上的注释文档会用作生成出来的 OpenAPI 规范中的参数描述。

```rust
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Query {
    /// Query todo items by name.
    name: String
}
```

### ToParameters Container Attributes for `#[salvo(parameters(...))]`

以下属性可以用在那些派生于 `ToParameters` 的结构体的容器属性 `#[salvo(parameters(…))]`

- `names(...)` 为作为路径参数使用的结构体的未命名字段定义逗号分隔的名称列表。仅支持在未命名结构体上使用。
- `style = ...` 可定义所有参数的序列化方式，由 [`ParameterStyle`][style] 指定。默认值基于 _`parameter_in`_ 属性。
- `default_parameter_in = ...` 定义此字段的参数使用的默认位置，该位置的值来自于 [`parameter::ParameterIn`][in_enum]。如果没有提供此属性，则默认来自 `query`。
- `rename_all = ...` 可以作为 `serde` 的 `rename_all` 的替代方案。实际上提供了相同的功能。

使用 `names` 给单个未命名的参数定义名称。

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id")))]
struct Id(u64);
```

使用 `names` 给多个未命名的参数定义名称。

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id", "name")))]
struct IdAndName(u64, String);
```

### ToParameters Field Attributes for `#[salvo(parameter(...))]`

以下属性可以在结构体字段上使用 `#[salvo(parameter(...))]`：

- `style = ...` 定义参数如何被 [`ParameterStyle`][style] 序列化. 默认值基于 _`parameter_in`_ 属性.

- `parameter_in = ...` 使用来自 [`parameter::ParameterIn`][in_enum] 的值定义这个字段参数在哪里. 如果没有提供这个值，则默认来自 `query`。

- `explode` 定义是否为每个在 _`object`_ 或 _`array`_ 中的参数创建新的 _`parameter=value`_ 对。

- `allow_reserved` 定义参数值中是否允许出现保留字符 _`:/?#[]@!$&'()*+,;=`_。

- `example = ...` 可以是方法的引用或 _`json!(...)`_。给定的示例会覆盖底层参数类型的任何示例。

- `value_type = ...` 可被用于重写 OpenAPI 规范中字段使用的默认类型。在默认类型与实际类型不对应的情况下很有用，比如使用非 [`ToSchema`][to_schema] 或 [`primitive` types][primitive] 中定义的第三方类型时。值可以是正常情况下可被序列化为 JSON 的任意 Rust 类型或如 _`Object`_._`Object`_ 这种会被渲染成通用 OpenAPI 对象的自定义类型。

- `inline` 如果启用，这个字段类型的定义必须来自 [`ToSchema`][to_schema]，且这个定义会被内联。

- `default = ...` 可以是方法引用或 _`json!(...)`_。

- `format = ...` 可以是 [`KnownFormat`][known_format] 枚举的变体，或者是字符串形式的开放值。默认情况下，格式是根据属性的类型根据 OpenApi 规范推导而来。

- `write_only` 定义属性仅用于**写**操作 _POST,PUT,PATCH_ 而不是 _GET_。

- `read_only` 定义属性仅用于**读**操作 _GET_ 而不是 _POST,PUT,PATCH_。

- `nullable` 定义属性是否可为 `null` （注意这与非必需不同）。

- `required = ...` 用于强制要求参数必传。[参见规则][derive@ToParameters#field-nullability-and-required-rules]。

- `rename = ...` 可以作为 `serde` 的 `rename` 的替代方案。实际上提供了相同的功能。

- `multiple_of = ...` 用于定义值的倍数。只有当用这个关键字的值去除参数值，并且结果是一个整数时，参数值才被认为是有效的。倍数值必须严格大于 _`0`_.

- `maximum = ...` 用于定义取值的上限，包含当前取值。

- `minimum = ...` 用于定义取值的下限，包含当前取值。

- `exclusive_maximum = ...` 用于定义取值的上限，不包含当前取值。

- `exclusive_minimum = ...` 用于定义取值的下限，不包含当前取值。

- `max_length = ...` 用于定义 `string` 类型取值的最大长度。Can be used to define maximum length for `string` types.

- `min_length = ...` 用于定义 `string` 类型取值的最小长度。Can be used to define minimum length for `string` types.

- `pattern = ...` 用于定义字段值必须匹配的有效的正则表达式，正则表达式采用 _ECMA-262_ 版本。

- `max_items = ...` 可用于定义 `array` 类型字段允许的最大项数。值必须是非负整数。

- `min_items = ...` 可用于定义 `array` 类型字段允许的最小项数。值必须是非负整数。

- `with_schema = ...` 使用函数引用创建出的 _`schema`_ 而不是默认的 _`schema`_。该函数必须满足定义`fn() -> Into<RefOr<Schema>>`。它不接收任何参数并且必须返回任何可以转换为 `RefOr<Schema>` 的值。

- `additional_properties = ...` 用于为 `map` 定义自由形式类型，比如 [`HashMap`]
(std::collections::HashMap) 和 [`BTreeMap`](std::collections::BTreeMap)。自由形式类型允许在映射值中使用任意类型。支持的格式有 _`additional_properties`_ 和 _`additional_properties = true`_。

#### Field nullability and required rules

一些应用于 _`ToParameters`_ 字段属性的是否可为空和是否必需的规则同样可用于 _`ToSchema`_ 字段属性。[参见规则][`derive@ToSchema#field-nullability-and-required-rules`]。

### Partial `#[serde(...)]` attributes support

ToParameters 派生目前支持部分 [serde 属性]。这些支持的属性将反映到生成的 OpenAPI 文档中。目前支持以下属性：

- `rename_all = "..."` 在容器级别支持。
- `rename = "..."` **仅**在字段级别支持。
- `default` 根据 [serde attributes] 在容器级和字段级支持。
- `skip_serializing_if = "..."` **仅**在字段级别支持。
- `with = ...` **仅**在字段级别支持。
- `skip_serializing = "..."` **仅**在字段级或变体级支持。
- `skip_deserializing = "..."` **仅**在字段级或变体级支持。
- `skip = "..."` **仅**在字段级别支持。

其他的 _`serde`_ 属性将影响序列化，但不会反映在生成的 OpenAPI 文档上。

### 示例

_**演示使用 `#[salvo(parameters(...))]` 容器属性结合 [`ToParameters`][to_parameters] 的用法，用在路径参数上，并内联一个查询字段：**_

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

_**使用 `value_type` 将 `String` 类型覆盖为 `i64` 类型。**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = i64))]
    id: String,
}
```

_**使用 `value_type` 将 `String` 类型覆盖为 `Object` 类型。在 OpenAPI 规范中，`Object` 类型会显示成 `type:object`。**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Object))]
    id: String,
}
```

_**你也可以用一个泛型来覆盖字段的默认类型。**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Option<String>))]
    id: String
}
```

_**你甚至可以用一个 [`Vec`] 覆盖另一个 [`Vec`]。**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Vec<i32>))]
    id: Vec<String>
}
```

_**我们可以用另一个 [`ToSchema`][to_schema] 来覆盖字段类型。**_

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

_**属性值的校验示例**_

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

_**使用 `schema_with` 为字段手动实现 schema。**_

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

- `rename_all = ...`: 支持于 `serde` 类似的语法定义重命名字段的规则. 如果同时定义了 `#[serde(rename_all = "...")]` 和 `#[salvo(schema(rename_all = "..."))]`, 则优先使用 `#[serde(rename_all = "...")]`.

- `symbol = ...`: 一个字符串字面量, 用于定义结构在 OpenAPI 中线上的名字路径. 比如 `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: 可以使用结构体的 `Default` 实现来为所有字段填充默认值。

### 错误处理方式

对于一般的应用, 我们会定义一个全局的错误类型 (AppError), 为 AppError 实现 `Writer` 或者 `Scribe`, 以便可以将错误作为网页信息发送给客户端.

而对于 OpenAPI, 我们为了能达到必要的错误信息, 我们还需要为这个错误实现 `EndpointOutRegister`:

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

此错误集中定义了整个网页应用可能返回的所有错误信息, 然而, 很多时候我们的 `Handler` 里面可能只包含其中几种具体错误类型, 此时可以使用 `status_codes` 过滤出需要的错误类型信息:

```rust
#[endpoint(status_codes(201, 409))]
pub async fn create_todo(new_todo: JsonBody<Todo>) -> Result<StatusCode, Error> {
    Ok(StatusCode::CREATED)
}
```
