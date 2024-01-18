# OpenAPI

OpenAPI 是一个开源的规范，用于描述 RESTful APIs 的接口设计.它以 JSON 或 YAML 格式定义了 API 的请求和响应的结构、参数、返回类型、错误码等细节，使得客户端和服务端之间的通信更加明确和规范化.

OpenAPI 最初是 Swagger 规范的开源版本，现在已经成为了一个独立的项目，并得到了许多大型企业和开发者的支持.使用 OpenAPI 规范可以帮助开发团队更好地协作，减少沟通成本，提高开发效率.同时，OpenAPI 还为开发者提供了自动生成 API 文档、Mock 数据和测试用例等工具，方便开发和测试工作.

Salvo 提供了 OpenAPI 的集成 (修改自 [utoipa](https://github.com/juhaku/utoipa)).

_**示例代码**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

在浏览器里面输入 `http://localhost:5800/swagger-ui` 就可以看到 Swagger UI 的页面.


Salvo 中的 OpenAPI 集成是相当优雅的，对于上面的示例，相比于普通的 Salvo 项目，我们只是做了以下几步：

- 在 `Cargo.toml` 中开启 `oapi` 功能: `salvo = { workspace = true, features = ["oapi"] }`;

- 把 `[handler]` 换成 `[endpoint]`;

- 使用 `name: QueryParam<String, false>` 获取查询字符串的值, 当你访问网址 `http://localhost/hello?name=chris` 时, 这个 `name` 的查询字符串就会被解析. `QueryParam<String, false>` 这里的 `false` 代表这个参数是可以省略的, 如果访问 `http://localhost/hello` 依然不会报错. 相反, 如果是 `QueryParam<String, true>` 则代表此参数是必须提供的, 否则返回错误.

- 创建 `OpenAPI` 并且创建对应的 `Router`. `OpenApi::new("test api", "0.0.1").merge_router(&router)` 这里的 `merge_router` 表示这个 `OpenAPI` 通过解析某个路由获取它和它的子孙路由获取必要的文档信息. 某些路由的 `Handler` 可能没有提供生成文档的信息, 这些路由将被忽略, 比如使用 `#[handler]` 宏而非 `#[endpoint]` 宏定义的 `Handler`. 也就是说, 实际项目中, 为了开发进度等原因, 你可以选择实现不生成 OpenAPI 文档, 或者部分生成 OpenAPI 文档. 后续可以逐步增加生成 OpenAPI 接口的数量, 而你需要做的也仅仅只是把  `#[handler]` 改成 `#[endpoint]`, 以及修改函数签名.


## 数据提取器

通过 `use salvo::oapi::extract:*;`  可以导入预置的常用的数据提取器. 提取器会提供一些必要的信息给 Salvo, 以便 Salvo 生成 OpenAPI 的文档.

- `QueryParam<T, const REQUIRED: bool>`: 一个从查询字符串提取数据的提取器. `QueryParam<T, false>` 代表此参数不是必须的, 可以省略. `QueryParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `HeaderParam<T, const REQUIRED: bool>`: 一个从请求的头部信息中提取数据的提取器. `HeaderParam<T, false>` 代表此参数不是必须的, 可以省略. `HeaderParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `CookieParam<T, const REQUIRED: bool>`: 一个从请求的头部信息中提取数据的提取器. `CookieParam<T, false>` 代表此参数不是必须的, 可以省略. `CookieParam<T, true>` 代表此参数是必须的, 不可以省略, 如果不提供, 则返回错误;

- `PathParam<T>`: 一个从请求 `URL` 中提取路径参数的提取器. 此参数如果不存在, 路由匹配就是不成功, 因此不存在可以省略的情况;

- `FormBody<T>`: 从请求提交的表单中提取信息;

- `JsonBody<T>`: 从请求提交的 JSON 格式的负载中提取信息;


## `#[endpoint]` 宏

在生成 OpenAPI 文档时, 需要使用 `#[endpoint]` 宏代替常规的 `#[handler]` 宏, 它实际上是一个增强版本的 `#[handler]` 宏. 

- 它可以通过函数的签名获取生成 OpenAPI 所必须的信息;

- 对于不方便通过签名提供的信息, 可以直接在 `#[endpoint]` 宏中添加属性的方式提供, 通过这种方式提供的信息会于通过函数签名获取的信息合并, 如果存在冲突, 则会覆盖函数签名提供的信息.

你可以使用 Rust 自带的 `#[deprecated]` 属性标注某个 Handler 已经过时被废弃. 虽然 `#[deprecated]` 属性支持添加诸如废弃原因,版本等信息, 但是 OpenAPI 并不支持, 因此这些信息在生成 OpenAPI 时将会被忽略.

代码中的文档注释部分会自动被提取用于生成 OpenAPI, 第一行被用于生成 _`summary`_, 整个注释部分会被用于生成 _`description`_.

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


  - `example = ...` 可以是 `json!(...)`. `json!(...)` 会被 `serde_json::json!` 解析为`serde_json::Value`.

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
#
#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id")))]
struct Id(u64);
```

Use `names` to define names for multiple unnamed arguments.
```
# use salvo_oapi::ToParameters;
#
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
#
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
#
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
#
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
#
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
#
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


- `rename_all = ...`: 支持于 `serde` 类似的语法定义重命名字段的规则. 如果同时定义了 `#[serde(rename_all = "...")]` 和 `#[salvo(schema(rename_all = "..."))]`, 则优先使用 `#[serde(rename_all = "...")]`.

- `symbol = ...`: 一个字符串字面量, 用于定义结构在 OpenAPI 中线上的名字路径. 比如 `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: Can be used to populate default values on all fields using the struct’s Default implementation.


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