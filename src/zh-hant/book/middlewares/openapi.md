# OpenAPI

Modified from [utoipa](https://github.com/juhaku/utoipa), It uses simple proc macros which
you can use to annotate your code to have items documented.


# Crate Features

* **yaml** Enables **serde_yaml** serialization of OpenAPI objects.
* **chrono** Add support for [chrono](https://crates.io/crates/chrono) `DateTime`, `Date`, `NaiveDate` and `Duration`
  types. By default these types are parsed to `string` types with additional `format` information.
  `format: date-time` for `DateTime` and `format: date` for `Date` and `NaiveDate` according
  [RFC3339](https://xml2rfc.ietf.org/public/rfc/html/rfc3339.html#anchor14) as `ISO-8601`. To
  override default `string` representation users have to use `value_type` attribute to override the type.
  See [docs](https://docs.rs/salvo_oapi/latest/salvo_oapi/derive.AsSchema.html) for more details.
* **time** Add support for [time](https://crates.io/crates/time) `OffsetDateTime`, `PrimitiveDateTime`, `Date`, and `Duration` types.
  By default these types are parsed as `string`. `OffsetDateTime` and `PrimitiveDateTime` will use `date-time` format. `Date` will use
  `date` format and `Duration` will not have any format. To override default `string` representation users have to use `value_type` attribute
  to override the type. See [docs](https://docs.rs/salvo_oapi/latest/salvo_oapi/derive.AsSchema.html) for more details.
* **decimal** Add support for [rust_decimal](https://crates.io/crates/rust_decimal) `Decimal` type. **By default**
  it is interpreted as `String`. If you wish to change the format you need to override the type.
  See the `value_type` in [`AsSchema` derive docs][as_schema_derive].
* **uuid** Add support for [uuid](https://github.com/uuid-rs/uuid). `Uuid` type will be presented as `String` with
  format `uuid` in OpenAPI spec.
* **smallvec** Add support for [smallvec](https://crates.io/crates/smallvec). `SmallVec` will be treated as `Vec`.
* **indexmap** Add support for [indexmap](https://crates.io/crates/indexmap). When enabled `IndexMap` will be rendered as a map similar to
  `BTreeMap` and `HashMap`.


### Endpoint

Endpoint attribute macro implements OpenAPI path for the decorated function.

Macro accepts set of attributes that can be used to configure and override default values what are resolved automatically.

You can use the Rust's own `#[deprecated]` attribute on functions to mark it as deprecated and it will
reflect to the generated OpenAPI spec. Only **parameters** has a special **deprecated** attribute to define them as deprecated.

`#[deprecated]` attribute supports adding additional details such as a reason and or since version but this is is not supported in
OpenAPI. OpenAPI has only a boolean flag to determine deprecation. While it is totally okay to declare deprecated with reason
`#[deprecated  = "There is better way to do this"]` the reason would not render in OpenAPI spec.

Doc comment at decorated function will be used for _`description`_ and _`summary`_ of the path.
First line of the doc comment will be used as the _`summary`_ and the whole doc comment will be
used as _`description`_.
```
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[salvo_oapi::endpoint()]
fn endpoint() {}
```

# Endpoint Attributes

* `operation_id = ...` Unique operation id for the endpoint. By default this is mapped to function name.
  The operation_id can be any valid expression (e.g. string literals, macro invocations, variables) so long
  as its result can be converted to a `String` using `String::from`.

* `tag = "..."` Can be used to group operations. Operations with same tag are grouped together. By default
  this is derived from the handler that is given to [`OpenApi`][openapi]. If derive results empty str
  then default value _`crate`_ is used instead.

* `request_body = ... | request_body(...)` Defining request body indicates that the request is expecting request body within
  the performed request.

* `responses(...)` Slice of responses the endpoint is going to possibly return to the caller.

* `parameters(...)` Slice of parameters that the endpoint accepts.

* `security(...)` List of [`SecurityRequirement`][security]s local to the path operation.

# Request Body Attributes

**Simple format definition by `request_body = ...`**
* _`request_body = Type`_, _`request_body = inline(Type)`_ or _`request_body = ref("...")`_.
  The given _`Type`_ can be any Rust type that is JSON parseable. It can be Option, Vec or Map etc.
  With _`inline(...)`_ the schema will be inlined instead of a referenced which is the default for
  [`AsSchema`][as_schema] types. _`ref("./external.json")`_ can be used to reference external
  json file for body schema.

**Advanced format definition by `request_body(...)`**
* `content = ...` Can be _`content = Type`_, _`content = inline(Type)`_ or _`content = ref("...")`_. The
  given _`Type`_ can be any Rust type that is JSON parseable. It can be Option, Vec
  or Map etc. With _`inline(...)`_ the schema will be inlined instead of a referenced
  which is the default for [`AsSchema`][as_schema] types. _`ref("./external.json")`_
  can be used to reference external json file for body schema.

* `description = "..."` Define the description for the request body object as str.

* `content_type = "..."` Can be used to override the default behavior of auto resolving the content type
  from the `content` attribute. If defined the value should be valid content type such as
  _`application/json`_. By default the content type is _`text/plain`_ for
  [primitive Rust types][primitive], `application/octet-stream` for _`[u8]`_ and
  _`application/json`_ for struct and complex enum types.

* `example = ...` Can be _`json!(...)`_. _`json!(...)`_ should be something that
  _`serde_json::json!`_ can parse as a _`serde_json::Value`_.

* `examples(...)` Define multiple examples for single request body. This attribute is mutually
  exclusive to the _`example`_ attribute and if both are defined this will override the _`example`_.
  This has same syntax as _`examples(...)`_ in [Response Attributes](#response-attributes)
  _examples(...)_

_**Example request body definitions.**_
```text
 request_body(content = String, description = "Xml as string request", content_type = "text/xml"),
 request_body = Pet,
 request_body = Option<[Pet]>,
```

# Response Attributes

* `status = ...` Is either a valid http status code integer. E.g. _`200`_ or a string value representing
  a range such as _`"4XX"`_ or `"default"` or a valid _`http::status::StatusCode`_.
  _`StatusCode`_ can either be use path to the status code or _status code_ constant directly.

* `description = "..."` Define description for the response as str.

* `body = ...` Optional response body object type. When left empty response does not expect to send any
  response body. Can be _`body = Type`_, _`body = inline(Type)`_, or _`body = ref("...")`_.
  The given _`Type`_ can be any Rust type that is JSON parseable. It can be Option, Vec or Map etc.
  With _`inline(...)`_ the schema will be inlined instead of a referenced which is the default for
  [`AsSchema`][as_schema] types. _`ref("./external.json")`_
  can be used to reference external json file for body schema.

* `content_type = "..." | content_type = [...]` Can be used to override the default behavior of auto resolving the content type
  from the `body` attribute. If defined the value should be valid content type such as
  _`application/json`_. By default the content type is _`text/plain`_ for
  [primitive Rust types][primitive], `application/octet-stream` for _`[u8]`_ and
  _`application/json`_ for struct and complex enum types.
  Content type can also be slice of **content_type** values if the endpoint support returning multiple
 response content types. E.g _`["application/json", "text/xml"]`_ would indicate that endpoint can return both
 _`json`_ and _`xml`_ formats. **The order** of the content types define the default example show first in
 the Swagger UI. Swagger UI wil use the first _`content_type`_ value as a default example.

* `headers(...)` Slice of response headers that are returned back to a caller.

* `example = ...` Can be _`json!(...)`_. _`json!(...)`_ should be something that
  _`serde_json::json!`_ can parse as a _`serde_json::Value`_.

* `response = ...` Type what implements [`AsResponse`][as_response_trait] trait. This can alternatively be used to
   define response attributes. _`response`_ attribute cannot co-exist with other than _`status`_ attribute.

* `content((...), (...))` Can be used to define multiple return types for single response status. Supported format for single
  _content_ is `(content_type = response_body, example = "...", examples(...))`. _`example`_
  and _`examples`_ are optional arguments. Examples attribute behaves exactly same way as in
  the response and is mutually exclusive with the example attribute.

* `examples(...)` Define multiple examples for single response. This attribute is mutually
  exclusive to the _`example`_ attribute and if both are defined this will override the _`example`_.
    * `name = ...` This is first attribute and value must be literal string.
    * `summary = ...` Short description of example. Value must be literal string.
    * `description = ...` Long description of example. Attribute supports markdown for rich text
      representation. Value must be literal string.
    * `value = ...` Example value. It must be _`json!(...)`_. _`json!(...)`_ should be something that
      _`serde_json::json!`_ can parse as a _`serde_json::Value`_.
    * `external_value = ...` Define URI to literal example value. This is mutually exclusive to
      the _`value`_ attribute. Value must be literal string.

     _**Example of example definition.**_
    ```text
     ("John" = (summary = "This is John", value = json!({"name": "John"})))
    ```

**Minimal response format:**
```text
responses(
    (status = 200, description = "success response"),
    (status = 404, description = "resource missing"),
    (status = "5XX", description = "server error"),
    (status = StatusCode::INTERNAL_SERVER_ERROR, description = "internal server error"),
    (status = IM_A_TEAPOT, description = "happy easter")
)
```

**More complete Response:**
```text
responses(
    (status = 200, description = "Success response", body = Pet, content_type = "application/json",
        headers(...),
        example = json!({"id": 1, "name": "bob the cat"})
    )
)
```

**Response with multiple response content types:**
```text
responses(
    (status = 200, description = "Success response", body = Pet, content_type = ["application/json", "text/xml"])
)
```

**Multiple response return types with _`content(...)`_ attribute:**

_**Define multiple response return types for single response status with their own example.**_
```text
responses(
   (status = 200, content(
           ("application/vnd.user.v1+json" = User, example = json!(User {id: "id".to_string()})),
           ("application/vnd.user.v2+json" = User2, example = json!(User2 {id: 2}))
       )
   )
)
```

### Using `AsResponse` for reusable responses

_**`ReusableResponse` must be a type that implements [`AsResponse`][as_response_trait].**_
```text
responses(
    (status = 200, response = ReusableResponse)
)
```

_**[`AsResponse`][as_response_trait] can also be inlined to the responses map.**_
```text
responses(
    (status = 200, response = inline(ReusableResponse))
)
```

## Responses from `AsResponses`

_**Responses for a path can be specified with one or more types that implement
[`AsResponses`][as_responses_trait].**_
```text
responses(MyResponse)
```

# Response Header Attributes

* `name` Name of the header. E.g. _`x-csrf-token`_

* `type` Additional type of the header value. Can be `Type` or `inline(Type)`.
  The given _`Type`_ can be any Rust type that is JSON parseable. It can be Option, Vec or Map etc.
  With _`inline(...)`_ the schema will be inlined instead of a referenced which is the default for
  [`AsSchema`][as_schema] types. **Reminder!** It's up to the user to use valid type for the
  response header.

* `description = "..."` Can be used to define optional description for the response header as str.

**Header supported formats:**

```text
("x-csrf-token"),
("x-csrf-token" = String, description = "New csrf token"),
```

# Params Attributes

The list of attributes inside the `parameters(...)` attribute can take two forms: [Tuples](#tuples) or [AsParameters
Type](#intoparams-type).

## Tuples

In the tuples format, parameters are specified using the following attributes inside a list of
tuples separated by commas:

* `name` _**Must be the first argument**_. Define the name for parameter.

* `parameter_type` Define possible type for the parameter. Can be `Type` or `inline(Type)`.
  The given _`Type`_ can be any Rust type that is JSON parseable. It can be Option, Vec or Map etc.
  With _`inline(...)`_ the schema will be inlined instead of a referenced which is the default for
  [`AsSchema`][as_schema] types. Parameter type is placed after `name` with
  equals sign E.g. _`"id" = String`_

* `in` _**Must be placed after name or parameter_type**_. Define the place of the parameter.
  This must be one of the variants of [`parameter::ParameterIn`][in_enum].
  E.g. _`Path, Query, Header, Cookie`_

* `deprecated` Define whether the parameter is deprecated or not. Can optionally be defined
   with explicit `bool` value as _`deprecated = bool`_.

* `description = "..."` Define possible description for the parameter as str.

* `style = ...` Defines how parameters are serialized by [`ParameterStyle`][style]. Default values are based on _`in`_ attribute.

* `explode` Defines whether new _`parameter=value`_ is created for each parameter withing _`object`_ or _`array`_.

* `allow_reserved` Defines whether reserved characters _`:/?#[]@!$&'()*+,;=`_ is allowed within value.

* `example = ...` Can method reference or _`json!(...)`_. Given example
  will override any example in underlying parameter type.

##### Parameter type attributes

These attributes supported when _`parameter_type`_ is present. Either by manually providing one
or otherwise resolved e.g from path macro argument when _`yaml`_ crate feature is
enabled.

* `format = ...` May either be variant of the [`KnownFormat`][known_format] enum, or otherwise
  an open value as a string. By default the format is derived from the type of the property
  according OpenApi spec.

* `write_only` Defines property is only used in **write** operations *POST,PUT,PATCH* but not in *GET*

* `read_only` Defines property is only used in **read** operations *GET* but not in *POST,PUT,PATCH*

* `nullable` Defines property is nullable (note this is different to non-required).

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

**For example:**

```text
parameters(
    ("id" = String, Path, deprecated, description = "Pet database id"),
    ("name", Path, deprecated, description = "Pet name"),
    (
        "value" = inline(Option<[String]>),
        Query,
        description = "Value description",
        style = Form,
        allow_reserved,
        deprecated,
        explode,
        example = json!(["Value"])),
        max_length = 10,
        min_items = 1
    )
)
```

## AsParameters Type

In the AsParameters parameters format, the parameters are specified using an identifier for a type
that implements [`AsParameters`][as_parameters]. See [`AsParameters`][as_parameters] for an
example.

```text
parameters(MyParameters)
```

**Note!** that `MyParameters` can also be used in combination with the [tuples
representation](#tuples) or other structs.
```text
parameters(
    MyParameters1,
    MyParameters2,
    ("id" = String, Path, deprecated, description = "Pet database id"),
)
```


_**More minimal example with the defaults.**_
```
# use salvo_core::prelude::*;
# use salvo_oapi::AsSchema;
# #[derive(AsSchema, Extractible, serde::Deserialize, serde::Serialize, Debug)]
# struct Pet {
#    id: u64,
#    name: String,
# }
#
#[salvo_oapi::endpoint(
   request_body = Pet,
   responses(
        (status = 200, description = "Pet stored successfully", body = Pet,
            headers(
                ("x-cache-len", description = "Cache length")
            )
        ),
   ),
   parameters(
     ("x-csrf-token", Header, description = "Current csrf token of user"),
   )
)]
fn post_pet(res: &mut Response) {
    res.render(Json(Pet {
        id: 4,
        name: "bob the cat".to_string(),
    }));
}
```

_**Use of Rust's own `#[deprecated]` attribute will reflect to the generated OpenAPI spec and mark this operation as deprecated.**_
```
# use serde_json::json;
# use salvo_core::prelude::*;
# use salvo_oapi::{endpoint, extract::PathParam};
#[endpoint(
    responses(
        (status = 200, description = "Pet found from database")
    ),
    parameters(
        ("id", description = "Pet id"),
    )
)]
#[deprecated]
async fn get_pet_by_id(id: PathParam<i32>, res: &mut Response) {
    let json = json!({ "pet": format!("{:?}", id.value())});
    res.render(Json(json))
}
```

_**Example with multiple return types**_
```
# use salvo_core::prelude::*;
# use salvo_oapi::AsSchema;
# trait User {}
# #[derive(AsSchema)]
# struct User1 {
#   id: String
# }
# #[derive(AsSchema)]
# struct User2 {
#   id: String
# }
# impl User for User1 {}
#[salvo_oapi::endpoint(
    responses(
        (status = 200, content(
                ("application/vnd.user.v1+json" = User1, example = json!({"id": "id".to_string()})),
                ("application/vnd.user.v2+json" = User2, example = json!({"id": 2}))
            )
        )
    )
)]
async fn get_user() {
}
````

_**Example with multiple examples on single response.**_
```rust
# use salvo_core::prelude::*;

# #[derive(serde::Serialize, serde::Deserialize)]
# struct User {
#   name: String
# }
#[salvo_oapi::endpoint(
    responses(
        (status = 200, body = User,
            examples(
                ("Demo" = (summary = "This is summary", description = "Long description",
                            value = json!(User{name: "Demo".to_string()}))),
                ("John" = (summary = "Another user", value = json!({"name": "John"})))
             )
        )
    )
)]
async fn get_user() -> Json<User> {
  Json(User {name: "John".to_string()})
}
```

### AsSchema

This is `#[derive]` implementation for [`AsSchema`][as_schema] trait. The macro accepts one
`schema`
attribute optionally which can be used to enhance generated documentation. The attribute can be placed
at item level or field level in struct and enums. Currently placing this attribute to unnamed field does
not have any effect.

You can use the Rust's own `#[deprecated]` attribute on any struct, enum or field to mark it as deprecated and it will
reflect to the generated OpenAPI spec.

`#[deprecated]` attribute supports adding additional details such as a reason and or since version but this is is not supported in
OpenAPI. OpenAPI has only a boolean flag to determine deprecation. While it is totally okay to declare deprecated with reason
`#[deprecated  = "There is better way to do this"]` the reason would not render in OpenAPI spec.

Doc comments on fields will resolve to field descriptions in generated OpenAPI doc. On struct
level doc comments will resolve to object descriptions.

```
/// This is a pet
#[derive(salvo_oapi::AsSchema)]
struct Pet {
    /// Name for your pet
    name: String,
}
```

# Struct Optional Configuration Options for `#[schema(...)]`
* `example = ...` Can be _`json!(...)`_. _`json!(...)`_ should be something that
  _`serde_json::json!`_ can parse as a _`serde_json::Value`_.
* `xml(...)` Can be used to define [`Xml`][xml] object properties applicable to Structs.
* `title = ...` Literal string value. Can be used to define title for struct in OpenAPI
  document. Some OpenAPI code generation libraries also use this field as a name for the
  struct.
* `rename_all = ...` Supports same syntax as _serde_ _`rename_all`_ attribute. Will rename all fields
  of the structs accordingly. If both _serde_ `rename_all` and _schema_ _`rename_all`_ are defined
  __serde__ will take precedence.
* `symbol = ...` Can be used to define alternative path and name for the schema what will be used in
  the OpenAPI. E.g _`symbol = "path::to::Pet"`_. This would make the schema appear in the generated
  OpenAPI spec as _`path.to.Pet`_.
* `default` Can be used to populate default values on all fields using the struct's
  [`Default`](std::default::Default) implementation.

# Enum Optional Configuration Options for `#[schema(...)]`
* `example = ...` Can be method reference or _`json!(...)`_.
* `default = ...` Can be method reference or _`json!(...)`_.
* `title = ...` Literal string value. Can be used to define title for enum in OpenAPI
  document. Some OpenAPI code generation libraries also use this field as a name for the
  enum. __Note!__  ___Complex enum (enum with other than unit variants) does not support title!___
* `rename_all = ...` Supports same syntax as _serde_ _`rename_all`_ attribute. Will rename all
  variants of the enum accordingly. If both _serde_ `rename_all` and _schema_ _`rename_all`_
  are defined __serde__ will take precedence.
* `symbol = ...` Can be used to define alternative path and name for the schema what will be used in
  the OpenAPI. E.g _`symbol = "path::to::Pet"`_. This would make the schema appear in the generated
  OpenAPI spec as _`path.to.Pet`_.

# Enum Variant Optional Configuration Options for `#[schema(...)]`
Supports all variant specific configuration options e.g. if variant is _`UnnamedStruct`_ then
unnamed struct type configuration options are supported.

In addition to the variant type specific configuration options enum variants support custom
_`rename`_ attribute. It behaves similarly to serde's _`rename`_ attribute. If both _serde_
_`rename`_ and _schema_ _`rename`_ are defined __serde__ will take precedence.

# Unnamed Field Struct Optional Configuration Options for `#[schema(...)]`
* `example = ...` Can be method reference or _`json!(...)`_.
* `default = ...` Can be method reference or _`json!(...)`_. If no value is specified, and the struct has
  only one field, the field's default value in the schema will be set from the struct's
  [`Default`](std::default::Default) implementation.
* `format = ...` May either be variant of the [`KnownFormat`][known_format] enum, or otherwise
  an open value as a string. By default the format is derived from the type of the property
  according OpenApi spec.
* `value_type = ...` Can be used to override default type derived from type of the field used in OpenAPI spec.
  This is useful in cases where the default type does not correspond to the actual type e.g. when
  any third-party types are used which are not [`AsSchema`][as_schema]s nor [`primitive` types][primitive].
   Value can be any Rust type what normally could be used to serialize to JSON or custom type such as _`Object`_.
   _`Object`_ will be rendered as generic OpenAPI object _(`type: object`)_.
* `title = ...` Literal string value. Can be used to define title for struct in OpenAPI
  document. Some OpenAPI code generation libraries also use this field as a name for the
  struct.
* `symbol = ...` Can be used to define alternative path and name for the schema what will be used in
  the OpenAPI. E.g _`symbol = "path::to::Pet"`_. This would make the schema appear in the generated
  OpenAPI spec as _`path.to.Pet`_.

# Named Fields Optional Configuration Options for `#[schema(...)]`
* `example = ...` Can be method reference or _`json!(...)`_.
* `default = ...` Can be method reference or _`json!(...)`_.
* `format = ...` May either be variant of the [`KnownFormat`][known_format] enum, or otherwise
  an open value as a string. By default the format is derived from the type of the property
  according OpenApi spec.
* `write_only` Defines property is only used in **write** operations *POST,PUT,PATCH* but not in *GET*
* `read_only` Defines property is only used in **read** operations *GET* but not in *POST,PUT,PATCH*
* `value_type = ...` Can be used to override default type derived from type of the field used in OpenAPI spec.
  This is useful in cases where the default type does not correspond to the actual type e.g. when
  any third-party types are used which are not [`AsSchema`][as_schema]s nor [`primitive` types][primitive].
   Value can be any Rust type what normally could be used to serialize to JSON or custom type such as _`Object`_.
   _`Object`_ will be rendered as generic OpenAPI object _(`type: object`)_.
* `inline` If the type of this field implements [`AsSchema`][as_schema], then the schema definition
  will be inlined. **warning:** Don't use this for recursive data types!
* `required = ...` Can be used to enforce required status for the field. [See
  rules][derive@AsSchema#field-nullability-and-required-rules]
* `nullable` Defines property is nullable (note this is different to non-required).
* `rename = ...` Supports same syntax as _serde_ _`rename`_ attribute. Will rename field
  accordingly. If both _serde_ `rename` and _schema_ _`rename`_ are defined __serde__ will take
  precedence.
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

#### Field nullability and required rules

Field is considered _`required`_ if
* it is not `Option` field
* and it does not have _`skip_serializing_if`_ property
* and it does not have _`serde_with`_ _[`double_option`](https://docs.rs/serde_with/latest/serde_with/rust/double_option/index.html)_
* and it does not have default value provided with serde _`default`_
  attribute

Field is considered _`nullable`_ when field type is _`Option`_.

## Xml attribute Configuration Options

* `xml(name = "...")` Will set name for property or type.
* `xml(namespace = "...")` Will set namespace for xml element which needs to be valid uri.
* `xml(prefix = "...")` Will set prefix for name.
* `xml(attribute)` Will translate property to xml attribute instead of xml element.
* `xml(wrapped)` Will make wrapped xml element.
* `xml(wrapped(name = "wrap_name"))` Will override the wrapper elements name.

See [`Xml`][xml] for more details.

# Partial `#[serde(...)]` attributes support

`AsSchema` derive has partial support for [serde attributes]. These supported attributes will reflect to the
generated OpenAPI doc. For example if _`#[serde(skip)]`_ is defined the attribute will not show up in the OpenAPI spec at all since it will not never
be serialized anyway. Similarly the _`rename`_ and _`rename_all`_ will reflect to the generated OpenAPI doc.

* `rename_all = "..."` Supported at the container level.
* `rename = "..."` Supported **only** at the field or variant level.
* `skip = "..."` Supported  **only** at the field or variant level.
* `skip_serializing = "..."` Supported  **only** at the field or variant level.
* `skip_serializing_if = "..."` Supported  **only** at the field level.
* `with = ...` Supported **only at field level.**
* `tag = "..."` Supported at the container level. `tag` attribute works as a [discriminator field][discriminator] for an enum.
* `content = "..."` Supported at the container level, allows [adjacently-tagged enums](https://serde.rs/enum-representations.html#adjacently-tagged).
  This attribute requires that a `tag` is present, otherwise serde will trigger a compile-time
  failure.
* `untagged` Supported at the container level. Allows [untagged
enum representation](https://serde.rs/enum-representations.html#untagged).
* `default` Supported at the container level and field level according to [serde attributes].
* `flatten` Supported at the field level.

Other _`serde`_ attributes works as is but does not have any effect on the generated OpenAPI doc.

**Note!** `tag` attribute has some limitations like it cannot be used
with **unnamed field structs** and **tuple types**.  See more at
[enum representation docs](https://serde.rs/enum-representations.html).

**Note!** `with` attribute is used in tandem with [serde_with](https://github.com/jonasbb/serde_with) to recognize
_[`double_option`](https://docs.rs/serde_with/latest/serde_with/rust/double_option/index.html)_ from **field value**.
_`double_option`_ is **only** supported attribute from _`serde_with`_ crate.

```
# use serde::Serialize;
# use salvo_oapi::AsSchema;
#[derive(Serialize, AsSchema)]
struct Foo(String);

#[derive(Serialize, AsSchema)]
#[serde(rename_all = "camelCase")]
enum Bar {
    UnitValue,
    #[serde(rename_all = "camelCase")]
    NamedFields {
        #[serde(rename = "id")]
        named_id: &'static str,
        name_list: Option<Vec<String>>
    },
    UnnamedFields(Foo),
    #[serde(skip)]
    SkipMe,
}
```

_**Add custom `tag` to change JSON representation to be internally tagged.**_
```
# use serde::Serialize;
# use salvo_oapi::AsSchema;
#[derive(Serialize, AsSchema)]
struct Foo(String);

#[derive(Serialize, AsSchema)]
#[serde(tag = "tag")]
enum Bar {
    UnitValue,
    NamedFields {
        id: &'static str,
        names: Option<Vec<String>>
    },
}
```

_**Add serde `default` attribute for MyValue struct. Similarly `default` could be added to
individual fields as well. If `default` is given the field's affected will be treated
as optional.**_
```
 #[derive(salvo_oapi::AsSchema, serde::Deserialize, Default)]
 #[serde(default)]
 struct MyValue {
     field: String
 }
```

# `#[repr(...)]` attribute support

[Serde repr](https://github.com/dtolnay/serde-repr) allows field-less enums be represented by
their numeric value.

* `repr(u*)` for unsigned integer.
* `repr(i*)` for signed integer.

**Supported schema attributes**

* `example = ...` Can be method reference or _`json!(...)`_.
* `default = ...` Can be method reference or _`json!(...)`_.
* `title = ...` Literal string value. Can be used to define title for enum in OpenAPI
  document. Some OpenAPI code generation libraries also use this field as a name for the
  enum. __Note!__  ___Complex enum (enum with other than unit variants) does not support title!___
* `symbol = ...` Can be used to define alternative path and name for the schema what will be used in
  the OpenAPI. E.g _`symbol = "path::to::Pet"`_. This would make the schema appear in the generated
  OpenAPI spec as _`path.to.Pet`_.

_**Create enum with numeric values.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
#[repr(u8)]
#[schema(default = default_value, example = 2)]
enum Mode {
    One = 1,
    Two,
 }

fn default_value() -> u8 {
    1
}
```

_**You can use `skip` and `tag` attributes from serde.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema, serde::Serialize)]
#[repr(i8)]
#[serde(tag = "code")]
enum ExitCode {
    Error = -1,
    #[serde(skip)]
    Unknown = 0,
    Ok = 1,
 }
```

# Examples

_**Simple example of a Pet with descriptions and object level example.**_
```
# use salvo_oapi::AsSchema;
/// This is a pet.
#[derive(AsSchema)]
#[schema(example = json!({"name": "bob the cat", "id": 0}))]
struct Pet {
    /// Unique id of a pet.
    id: u64,
    /// Name of a pet.
    name: String,
    /// Age of a pet if known.
    age: Option<i32>,
}
```

_**The `schema` attribute can also be placed at field level as follows.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
struct Pet {
    #[schema(example = 1, default = 0)]
    id: u64,
    name: String,
    age: Option<i32>,
}
```

_**You can also use method reference for attribute values.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
struct Pet {
    #[schema(example = u64::default, default = u64::default)]
    id: u64,
    #[schema(default = default_name)]
    name: String,
    age: Option<i32>,
}

fn default_name() -> String {
    "bob".to_string()
}
```

_**For enums and unnamed field structs you can define `schema` at type level.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
#[schema(example = "Bus")]
enum VehicleType {
    Rocket, Car, Bus, Submarine
}
```

_**Also you write complex enum combining all above types.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
enum ErrorResponse {
    InvalidCredentials,
    #[schema(default = String::default, example = "Pet not found")]
    NotFound(String),
    System {
        #[schema(example = "Unknown system failure")]
        details: String,
    }
}
```

_**It is possible to specify the title of each variant to help generators create named structures.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
enum ErrorResponse {
    #[schema(title = "InvalidCredentials")]
    InvalidCredentials,
    #[schema(title = "NotFound")]
    NotFound(String),
}
```

_**Use `xml` attribute to manipulate xml output.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
#[schema(xml(name = "user", prefix = "u", namespace = "https://user.xml.schema.test"))]
struct User {
    #[schema(xml(attribute, prefix = "u"))]
    id: i64,
    #[schema(xml(name = "user_name", prefix = "u"))]
    username: String,
    #[schema(xml(wrapped(name = "linkList"), name = "link"))]
    links: Vec<String>,
    #[schema(xml(wrapped, name = "photo_url"))]
    photos_urls: Vec<String>
}
```

_**Use of Rust's own `#[deprecated]` attribute will reflect to generated OpenAPI spec.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
#[deprecated]
struct User {
    id: i64,
    username: String,
    links: Vec<String>,
    #[deprecated]
    photos_urls: Vec<String>
}
```

_**Enforce type being used in OpenAPI spec to [`String`] with `value_type` and set format to octet stream
with [`SchemaFormat::KnownFormat(KnownFormat::Binary)`][binary].**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
struct Post {
    id: i32,
    #[schema(value_type = String, format = Binary)]
    value: Vec<u8>,
}
```

_**Enforce type being used in OpenAPI spec to [`String`] with `value_type` option.**_
```
# use salvo_oapi::AsSchema;
#[derive(AsSchema)]
#[schema(value_type = String)]
struct Value(i64);
```

_**Use a virtual `Object` type to render generic `object` _(`type: object`)_ in OpenAPI spec.**_
```
# use salvo_oapi::AsSchema;
# mod custom {
#    struct NewBar;
# }
#
# struct Bar;
#[derive(AsSchema)]
struct Value {
    #[schema(value_type = Object)]
    field: Bar,
};
```

_**Serde `rename` / `rename_all` will take precedence over schema `rename` / `rename_all`.**_
```
#[derive(salvo_oapi::AsSchema, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
#[schema(rename_all = "UPPERCASE")]
enum Random {
    #[serde(rename = "string_value")]
    #[schema(rename = "custom_value")]
    String(String),

    Number {
        id: i32,
    }
}
```

_**Add `title` to the enum.**_
```
#[derive(salvo_oapi::AsSchema)]
#[schema(title = "UserType")]
enum UserType {
    Admin,
    Moderator,
    User,
}
```

_**Example with validation attributes.**_
```
#[derive(salvo_oapi::AsSchema, serde::Deserialize)]
struct Item {
    #[schema(maximum = 10, minimum = 5, multiple_of = 2.5)]
    id: i32,
    #[schema(max_length = 10, min_length = 5, pattern = "[a-z]*")]
    value: String,
    #[schema(max_items = 5, min_items = 1)]
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

#[derive(salvo_oapi::AsSchema)]
struct Value {
    #[schema(schema_with = custom_type)]
    id: String,
}
```

_**Use `as` attribute to change the name and the path of the schema in the generated OpenAPI
spec.**_
```
 #[derive(salvo_oapi::AsSchema)]
 #[schema(symbol = "api::models::person::Person")]
 struct Person {
     name: String,
 }
```

More examples for _`value_type`_ in [`AsParameters` derive docs][parameters].

[as_schema]: trait.AsSchema.html
[known_format]: openapi/schema/enum.KnownFormat.html
[binary]: openapi/schema/enum.KnownFormat.html#variant.Binary
[xml]: openapi/xml/struct.Xml.html
[as_parameters]: derive.AsParameters.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[serde attributes]: https://serde.rs/attributes.html
[discriminator]: openapi/schema/struct.Discriminator.html
[enum_schema]: derive.AsSchema.html#enum-optional-configuration-options-for-schema

### AsResponses

Generate responses with status codes what
can be attached to the [`salvo_oapi::endpoint`][path_as_responses].

This is `#[derive]` implementation of [`AsResponses`][as_responses] trait. [`derive@AsResponses`]
can be used to decorate _`structs`_ and _`enums`_ to generate response maps that can be used in
[`salvo_oapi::endpoint`][path_as_responses]. If _`struct`_ is decorated with [`derive@AsResponses`] it will be
used to create a map of responses containing single response. Decorating _`enum`_ with
[`derive@AsResponses`] will create a map of responses with a response for each variant of the _`enum`_.

Named field _`struct`_ decorated with [`derive@AsResponses`] will create a response with inlined schema
generated from the body of the struct. This is a conveniency which allows users to directly
create responses with schemas without first creating a separate [response][as_response] type.

Unit _`struct`_ behaves similarly to then named field struct. Only difference is that it will create
a response without content since there is no inner fields.

Unnamed field _`struct`_ decorated with [`derive@AsResponses`] will by default create a response with
referenced [schema][as_schema] if field is object or schema if type is [primitive
type][primitive]. _`#[as_schema]`_ attribute at field of unnamed _`struct`_ can be used to inline
the schema if type of the field implements [`AsSchema`][as_schema] trait. Alternatively
_`#[as_response]`_ and _`#[ref_response]`_ can be used at field to either reference a reusable
[response][as_response] or inline a reusable [response][as_response]. In both cases the field
type is expected to implement [`AsResponse`][as_response] trait.


Enum decorated with [`derive@AsResponses`] will create a response for each variant of the _`enum`_.
Each variant must have it's own _`#[response(...)]`_ definition. Unit variant will behave same
as unit _`struct`_ by creating a response without content. Similarly named field variant and
unnamed field variant behaves the same as it was named field _`struct`_ and unnamed field
_`struct`_.

_`#[response]`_ attribute can be used at named structs, unnamed structs, unit structs and enum
variants to alter [response attributes](#intoresponses-response-attributes) of responses.

Doc comment on a _`struct`_ or _`enum`_ variant will be used as a description for the response.
It can also be overridden with _`description = "..."`_ attribute.

# AsResponses `#[response(...)]` attributes

* `status = ...` Must be provided. Is either a valid http status code integer. E.g. _`200`_ or a
  string value representing a range such as _`"4XX"`_ or `"default"` or a valid _`http::status::StatusCode`_.
  _`StatusCode`_ can either be use path to the status code or _status code_ constant directly.

* `description = "..."` Define description for the response as str. This can be used to
  override the default description resolved from doc comments if present.

* `content_type = "..." | content_type = [...]` Can be used to override the default behavior of auto resolving the content type
  from the `body` attribute. If defined the value should be valid content type such as
  _`application/json`_. By default the content type is _`text/plain`_ for
  [primitive Rust types][primitive], `application/octet-stream` for _`[u8]`_ and
  _`application/json`_ for struct and complex enum types.
  Content type can also be slice of **content_type** values if the endpoint support returning multiple
 response content types. E.g _`["application/json", "text/xml"]`_ would indicate that endpoint can return both
 _`json`_ and _`xml`_ formats. **The order** of the content types define the default example show first in
 the Swagger UI. Swagger UI wil use the first _`content_type`_ value as a default example.

* `headers(...)` Slice of response headers that are returned back to a caller.

* `example = ...` Can be _`json!(...)`_. _`json!(...)`_ should be something that
  _`serde_json::json!`_ can parse as a _`serde_json::Value`_.

* `examples(...)` Define multiple examples for single response. This attribute is mutually
  exclusive to the _`example`_ attribute and if both are defined this will override the _`example`_.
    * `name = ...` This is first attribute and value must be literal string.
    * `summary = ...` Short description of example. Value must be literal string.
    * `description = ...` Long description of example. Attribute supports markdown for rich text
      representation. Value must be literal string.
    * `value = ...` Example value. It must be _`json!(...)`_. _`json!(...)`_ should be something that
      _`serde_json::json!`_ can parse as a _`serde_json::Value`_.
    * `external_value = ...` Define URI to literal example value. This is mutually exclusive to
      the _`value`_ attribute. Value must be literal string.

     _**Example of example definition.**_
    ```text
     ("John" = (summary = "This is John", value = json!({"name": "John"})))
    ```

# Examples

_**Use `AsResponses` to define [`salvo_oapi::endpoint`][path] responses.**_
```
# use salvo_core::http::{header::CONTENT_TYPE, HeaderValue};
# use salvo_core::prelude::*;
#[derive(salvo_oapi::AsSchema, Debug)]
struct BadRequest {
    message: String,
}

#[derive(salvo_oapi::AsResponses, Debug)]
enum UserResponses {
    /// Success response
    #[response(status = 200)]
    Success { value: String },

    #[response(status = 404)]
    NotFound,

    #[response(status = 400)]
    BadRequest(BadRequest),
}

impl Piece for UserResponses {
    fn render(self, res: &mut Response) {
        res.headers_mut()
            .insert(CONTENT_TYPE, HeaderValue::from_static("text/plain; charset=utf-8"));
        res.write_body(format!("{self:#?}")).ok();
    }
}

#[salvo_oapi::endpoint(
    responses(
        UserResponses
    )
)]
async fn get_user() -> UserResponses {
   UserResponses::NotFound
}
```
_**Named struct response with inlined schema.**_
```
/// This is success response
#[derive(salvo_oapi::AsResponses)]
#[response(status = 200)]
struct SuccessResponse {
    value: String,
}
```

_**Unit struct response without content.**_
```
#[derive(salvo_oapi::AsResponses)]
#[response(status = NOT_FOUND)]
struct NotFound;
```

_**Unnamed struct response with inlined response schema.**_
```
# #[derive(salvo_oapi::AsSchema)]
# struct Foo;
#[derive(salvo_oapi::AsResponses)]
#[response(status = 201)]
struct CreatedResponse(#[as_schema] Foo);
```

_**Enum with multiple responses.**_
```
# #[derive(salvo_oapi_macros::AsResponse)]
# struct Response {
#     message: String,
# }
# #[derive(salvo_oapi::AsSchema, Debug)]
# struct BadRequest {}
#[derive(salvo_oapi::AsResponses)]
enum UserResponses {
    /// Success response description.
    #[response(status = 200)]
    Success { value: String },

    #[response(status = 404)]
    NotFound,

    #[response(status = 400)]
    BadRequest(BadRequest),

    #[response(status = 500)]
    ServerError(#[ref_response] Response),

    #[response(status = 418)]
    TeaPot(#[as_response] Response),
}
```

[as_responses]: trait.AsResponses.html
[as_schema]: trait.AsSchema.html
[as_response]: trait.AsResponse.html
[path_as_responses]: attr.path.html#responses-from-intoresponses
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[path]: macro@crate::path

### AsResponse

Generate reusable OpenAPI response what can be used
in [`salvo_oapi::endpoint`][path] or in [`OpenApi`][openapi].

This is `#[derive]` implementation for [`AsResponse`][as_response] trait.


_`#[response]`_ attribute can be used to alter and add [response attributes](#toresponse-response-attributes).

_`#[content]`_ attributes is used to make enum variant a content of a specific type for the
response.

_`#[as_schema]`_ attribute is used to inline a schema for a response in unnamed structs or
enum variants with `#[content]` attribute. **Note!** [`AsSchema`] need to be implemented for
the field or variant type.

Type derived with _`AsResponse`_ uses provided doc comment as a description for the response. It
can alternatively be overridden with _`description = ...`_ attribute.

_`AsResponse`_ can be used in four different ways to generate OpenAPI response component.

1. By decorating `struct` or `enum` with [`derive@AsResponse`] derive macro. This will create a
   response with inlined schema resolved from the fields of the `struct` or `variants` of the
   enum.

   ```rust
    # use salvo_oapi::AsResponse;
    #[derive(AsResponse)]
    #[response(description = "Person response returns single Person entity")]
    struct Person {
        name: String,
    }
   ```

2. By decorating unnamed field `struct` with [`derive@AsResponse`] derive macro. Unnamed field struct
   allows users to use new type pattern to define one inner field which is used as a schema for
   the generated response. This allows users to define `Vec` and `Option` response types.
   Additionally these types can also be used with `#[as_schema]` attribute to inline the
   field's type schema if it implements [`AsSchema`] derive macro.

   ```rust
    # #[derive(salvo_oapi::AsSchema)]
    # struct Person {
    #     name: String,
    # }
    /// Person list response
    #[derive(salvo_oapi::AsResponse)]
    struct PersonList(Vec<Person>);
   ```

3. By decorating unit struct with [`derive@AsResponse`] derive macro. Unit structs will produce a
   response without body.

   ```rust
    /// Success response which does not have body.
    #[derive(salvo_oapi::AsResponse)]
    struct SuccessResponse;
   ```

4. By decorating `enum` with variants having `#[content(...)]` attribute. This allows users to
   define multiple response content schemas to single response according to OpenAPI spec.
   **Note!** Enum with _`content`_ attribute in variants cannot have enum level _`example`_ or
   _`examples`_ defined. Instead examples need to be defined per variant basis. Additionally
   these variants can also be used with `#[as_schema]` attribute to inline the variant's type schema
   if it implements [`AsSchema`] derive macro.

   ```rust
    #[derive(salvo_oapi::AsSchema)]
    struct Admin {
        name: String,
    }
    #[derive(salvo_oapi::AsSchema)]
    struct Admin2 {
        name: String,
        id: i32,
    }

    #[derive(salvo_oapi::AsResponse)]
    enum Person {
        #[response(examples(
            ("Person1" = (value = json!({"name": "name1"}))),
            ("Person2" = (value = json!({"name": "name2"})))
        ))]
        Admin(#[content("application/vnd-custom-v1+json")] Admin),

        #[response(example = json!({"name": "name3", "id": 1}))]
        Admin2(#[content("application/vnd-custom-v2+json")] #[as_schema] Admin2),
    }
   ```

# AsResponse `#[response(...)]` attributes

* `description = "..."` Define description for the response as str. This can be used to
  override the default description resolved from doc comments if present.

* `content_type = "..." | content_type = [...]` Can be used to override the default behavior of auto resolving the content type
  from the `body` attribute. If defined the value should be valid content type such as
  _`application/json`_. By default the content type is _`text/plain`_ for
  [primitive Rust types][primitive], `application/octet-stream` for _`[u8]`_ and
  _`application/json`_ for struct and complex enum types.
  Content type can also be slice of **content_type** values if the endpoint support returning multiple
 response content types. E.g _`["application/json", "text/xml"]`_ would indicate that endpoint can return both
 _`json`_ and _`xml`_ formats. **The order** of the content types define the default example show first in
 the Swagger UI. Swagger UI wil use the first _`content_type`_ value as a default example.

* `headers(...)` Slice of response headers that are returned back to a caller.

* `example = ...` Can be _`json!(...)`_. _`json!(...)`_ should be something that
  _`serde_json::json!`_ can parse as a _`serde_json::Value`_.

* `examples(...)` Define multiple examples for single response. This attribute is mutually
  exclusive to the _`example`_ attribute and if both are defined this will override the _`example`_.
    * `name = ...` This is first attribute and value must be literal string.
    * `summary = ...` Short description of example. Value must be literal string.
    * `description = ...` Long description of example. Attribute supports markdown for rich text
      representation. Value must be literal string.
    * `value = ...` Example value. It must be _`json!(...)`_. _`json!(...)`_ should be something that
      _`serde_json::json!`_ can parse as a _`serde_json::Value`_.
    * `external_value = ...` Define URI to literal example value. This is mutually exclusive to
      the _`value`_ attribute. Value must be literal string.

     _**Example of example definition.**_
    ```text
     ("John" = (summary = "This is John", value = json!({"name": "John"})))
    ```

# Examples

_**Use reusable response in operation handler.**_
```
use salvo_core::http::{header::CONTENT_TYPE, HeaderValue};
use salvo_core::prelude::*;
use salvo_oapi::{AsSchema, AsResponse, endpoint};

#[derive(AsResponse, AsSchema)]
struct PersonResponse {
   value: String
}
impl Piece for PersonResponse {
    fn render(self, res: &mut Response) {
        res.headers_mut()
            .insert(CONTENT_TYPE, HeaderValue::from_static("text/plain; charset=utf-8"));
        res.write_body(self.value).ok();
    }
}

#[endpoint(
    responses(
        (status = 200, response = PersonResponse)
    )
)]
fn get_person() -> PersonResponse {
    PersonResponse { value: "person".to_string() }
}
```

_**Create a response from named struct.**_
```
use salvo_oapi::{AsSchema, AsResponse};

 /// This is description
 ///
 /// It will also be used in `AsSchema` if present
 #[derive(AsSchema, AsResponse)]
 #[response(
     description = "Override description for response",
     content_type = "text/xml"
 )]
 #[response(
     example = json!({"name": "the name"}),
     headers(
         ("csrf-token", description = "response csrf token"),
         ("random-id" = i32)
     )
 )]
 struct Person {
     name: String,
 }
```

_**Create inlined person list response.**_
```
 # #[derive(salvo_oapi::AsSchema)]
 # struct Person {
 #     name: String,
 # }
 /// Person list response
 #[derive(salvo_oapi::AsResponse)]
 struct PersonList(#[as_schema] Vec<Person>);
```

_**Create enum response from variants.**_
```
 #[derive(salvo_oapi::AsResponse)]
 enum PersonType {
     Value(String),
     Foobar,
 }
```

[as_response]: trait.AsResponse.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[path]: attr.path.html
[openapi]: derive.OpenApi.html

### AsParameters
Generate [path parameters][path_params] from struct's
fields.

This is `#[derive]` implementation for [`AsParameters`][as_parameters] trait.

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
#[derive(salvo_oapi::AsParameters, serde::Deserialize)]
struct Query {
    /// Query todo items by name.
    name: String
}
```

# AsParameters Container Attributes for `#[parameters(...)]`

The following attributes are available for use in on the container attribute `#[parameters(...)]` for the struct
deriving `AsParameters`:

* `names(...)` Define comma separated list of names for unnamed fields of struct used as a path parameter.
   __Only__ supported on __unnamed structs__.
* `style = ...` Defines how all parameters are serialized by [`ParameterStyle`][style]. Default
   values are based on _`parameter_in`_ attribute.
* `parameter_in = ...` =  Defines where the parameters of this field are used with a value from
   [`parameter::ParameterIn`][in_enum]. There is no default value, if this attribute is not
   supplied, then the value is determined by the `parameter_in_provider` in
   [`AsParameters::parameters()`](trait.AsParameters.html#tymethod.parameters).
* `rename_all = ...` Can be provided to alternatively to the serde's `rename_all` attribute. Effectively provides same functionality.

Use `names` to define name for single unnamed argument.
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(names("id"))]
struct Id(u64);
```

Use `names` to define names for multiple unnamed arguments.
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(names("id", "name"))]
struct IdAndName(u64, String);
```

# AsParameters Field Attributes for `#[parameter(...)]`

The following attributes are available for use in the `#[parameter(...)]` on struct fields:

* `style = ...` Defines how the parameter is serialized by [`ParameterStyle`][style]. Default values are based on _`parameter_in`_ attribute.

* `explode` Defines whether new _`parameter=value`_ pair is created for each parameter withing _`object`_ or _`array`_.

* `allow_reserved` Defines whether reserved characters _`:/?#[]@!$&'()*+,;=`_ is allowed within value.

* `example = ...` Can be method reference or _`json!(...)`_. Given example
  will override any example in underlying parameter type.

* `value_type = ...` Can be used to override default type derived from type of the field used in OpenAPI spec.
  This is useful in cases where the default type does not correspond to the actual type e.g. when
  any third-party types are used which are not [`AsSchema`][as_schema]s nor [`primitive` types][primitive].
   Value can be any Rust type what normally could be used to serialize to JSON or custom type such as _`Object`_.
   _`Object`_ will be rendered as generic OpenAPI object.

* `inline` If set, the schema for this field's type needs to be a [`AsSchema`][as_schema], and
  the schema definition will be inlined.

* `default = ...` Can be method reference or _`json!(...)`_.

* `format = ...` May either be variant of the [`KnownFormat`][known_format] enum, or otherwise
  an open value as a string. By default the format is derived from the type of the property
  according OpenApi spec.

* `write_only` Defines property is only used in **write** operations *POST,PUT,PATCH* but not in *GET*

* `read_only` Defines property is only used in **read** operations *GET* but not in *POST,PUT,PATCH*

* `xml(...)` Can be used to define [`Xml`][xml] object properties applicable to named fields.
   See configuration options at xml attributes of [`AsSchema`][as_schema_xml]

* `nullable` Defines property is nullable (note this is different to non-required).

* `required = ...` Can be used to enforce required status for the parameter. [See
   rules][derive@AsParameters#field-nullability-and-required-rules]

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

#### Field nullability and required rules

Same rules for nullability and required status apply for _`AsParameters`_ field attributes as for
_`AsSchema`_ field attributes. [See the rules][`derive@AsSchema#field-nullability-and-required-rules`].

# Partial `#[serde(...)]` attributes support

AsParameters derive has partial support for [serde attributes]. These supported attributes will reflect to the
generated OpenAPI doc. The following attributes are currently supported:

* `rename_all = "..."` Supported at the container level.
* `rename = "..."` Supported **only** at the field level.
* `default` Supported at the container level and field level according to [serde attributes].
* `skip_serializing_if = "..."` Supported  **only** at the field level.
* `with = ...` Supported **only** at field level.

Other _`serde`_ attributes will impact the serialization but will not be reflected on the generated OpenAPI doc.

# Examples

_**Demonstrate [`AsParameters`][as_parameters] usage with the `#[as_parameters(...)]` container attribute to
be used as a path query, and inlining a schema query field:**_

```
use serde::Deserialize;
use salvo_core::prelude::*;
use salvo_oapi::{AsParameters, AsSchema};

#[derive(Deserialize, AsSchema)]
#[serde(rename_all = "snake_case")]
enum PetKind {
    Dog,
    Cat,
}

#[derive(Deserialize, AsParameters)]
struct PetQuery {
    /// Name of pet
    name: Option<String>,
    /// Age of pet
    age: Option<i32>,
    /// Kind of pet
    #[parameter(inline)]
    kind: PetKind
}

#[salvo_oapi::endpoint(
    parameters(PetQuery),
    responses(
        (status = 200, description = "success response")
    )
)]
async fn get_pet(query: PetQuery) {
    // ...
}
```

_**Override `String` with `i64` using `value_type` attribute.**_
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Filter {
    #[parameter(value_type = i64)]
    id: String,
}
```

_**Override `String` with `Object` using `value_type` attribute. _`Object`_ will render as `type: object` in OpenAPI spec.**_
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Filter {
    #[parameter(value_type = Object)]
    id: String,
}
```

_**You can use a generic type to override the default type of the field.**_
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Filter {
    #[parameter(value_type = Option<String>)]
    id: String
}
```

_**You can even override a [`Vec`] with another one.**_
```
# use salvo_oapi::AsParameters;
#
#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Filter {
    #[parameter(value_type = Vec<i32>)]
    id: Vec<String>
}
```

_**We can override value with another [`AsSchema`][as_schema].**_
```
# use salvo_oapi::{AsParameters, AsSchema};
#
#[derive(AsSchema)]
struct Id {
    value: i64,
}

#[derive(AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Filter {
    #[parameter(value_type = Id)]
    id: String
}
```

_**Example with validation attributes.**_
```
#[derive(salvo_oapi::AsParameters, serde::Deserialize)]
struct Item {
    #[parameter(maximum = 10, minimum = 5, multiple_of = 2.5)]
    id: i32,
    #[parameter(max_length = 10, min_length = 5, pattern = "[a-z]*")]
    value: String,
    #[parameter(max_items = 5, min_items = 1)]
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

#[derive(salvo_oapi::AsParameters, serde::Deserialize)]
#[as_parameters(parameter_in = Query)]
struct Query {
    #[parameter(schema_with = custom_type)]
    email: String,
}
```

[as_schema]: trait.AsSchema.html
[known_format]: openapi/schema/enum.KnownFormat.html
[xml]: openapi/xml/struct.Xml.html
[as_parameters]: trait.AsParameters.html
[path_params]: attr.path.html#params-attributes
[struct]: https://doc.rust-lang.org/std/keyword.struct.html
[style]: openapi/path/enum.ParameterStyle.html
[in_enum]: salvo_oapi/openapi/path/enum.ParameterIn.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[serde attributes]: https://serde.rs/attributes.html

[in_enum]: salvo_oapi/openapi/path/enum.ParameterIn.html
[path]: trait.Path.html
[as_schema]: trait.AsSchema.html
[openapi]: derive.OpenApi.html
[security]: openapi/security/struct.SecurityRequirement.html
[security_schema]: openapi/security/struct.SecuritySchema.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[as_parameters]: trait.AsParameters.html
[style]: openapi/path/enum.ParameterStyle.html
[as_responses_trait]: trait.AsResponses.html
[as_parameters_derive]: derive.AsParameters.html
[as_response_trait]: trait.AsResponse.html
[known_format]: openapi/schema/enum.KnownFormat.html
[xml]: openapi/xml/struct.Xml.html
