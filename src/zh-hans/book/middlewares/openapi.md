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


- `rename_all = ...`: 支持于 `serde` 类似的语法定义重命名字段的规则. 如果同时定义了 `#[serde(rename_all = "...")]` 和 `#[salvo(schema(rename_all = "..."))]`, 则优先使用 `#[serde(rename_all = "...")]`.

- `symbol = ...`: 一个字符串字面量, 用于定义结构在 OpenAPI 中线上的名字路径. 比如 `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: Can be used to populate default values on all fields using the struct’s Default implementation.


### 错误处理方式

对于一般的应用, 我们会定义一个全局的错误类型 (AppError), 为 AppError 实现 `Writer` 或者 `Piece`, 以便可以将错误作为网页信息发送给客户端.

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