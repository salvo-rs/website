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
  See [docs](https://docs.rs/salvo_oapi/latest/salvo_oapi/derive.ToSchema.html) for more details.
* **time** Add support for [time](https://crates.io/crates/time) `OffsetDateTime`, `PrimitiveDateTime`, `Date`, and `Duration` types.
  By default these types are parsed as `string`. `OffsetDateTime` and `PrimitiveDateTime` will use `date-time` format. `Date` will use
  `date` format and `Duration` will not have any format. To override default `string` representation users have to use `value_type` attribute
  to override the type. See [docs](https://docs.rs/salvo_oapi/latest/salvo_oapi/derive.ToSchema.html) for more details.
* **decimal** Add support for [rust_decimal](https://crates.io/crates/rust_decimal) `Decimal` type. **By default**
  it is interpreted as `String`. If you wish to change the format you need to override the type.
  See the `value_type` in [`ToSchema` derive docs][as_schema_derive].
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

### TODO