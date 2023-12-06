# OpenAPI

OpenAPI is an open-source specification used to describe the interface design of RESTful APIs. It defines the details of the structure, parameters, return types, error codes, and other aspects of API requests and responses in JSON or YAML format, making communication between clients and servers more clear and standardized.

Initially developed as an open-source version of the Swagger specification, OpenAPI has now become an independent project and has gained support from many large enterprises and developers. Using the OpenAPI specification can help development teams collaborate better, reduce communication costs, and improve development efficiency. Additionally, OpenAPI provides developers with tools such as automatic API documentation generation, mock data, and test cases to facilitate development and testing work.

Salvo provides integration with OpenAPI (adapted from utoipa).

_**Example**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

To view the Swagger UI page, enter http://localhost:5800/swagger-ui in your browser.

The OpenAPI integration in Salvo is quite elegant. For the example above, compared to a normal Salvo project, we only need to take the following steps:

- Enable the oapi feature in `Cargo.toml`: `salvo = { workspace = true, features = ["oapi"] }`;

- Replace `#[handler]` with `#[endpoint]`;

- Use name: `QueryParam<String, false>` to retrieve the value of a query string. When you visit the URL `http://localhost/hello?name=chris`, the query string for this name parameter will be parsed. The false here indicates that this parameter is optional. If you visit `http://localhost/hello` without the name parameter, it will not cause an error. Conversely, if it is `QueryParam<String, true>`, it means that this parameter is required and an error will be returned if it is not provided.

- Create an OpenAPI and create the corresponding Router. `OpenApi::new("test api", "0.0.1").merge_router(&router)` here merge_router means that this OpenAPI obtains the necessary documentation information by parsing a certain route and its descendant routes. Some routes may not provide information for generating documentation, and these routes will be ignored, such as Handler defined using the `#[handler]` macro instead of the `#[endpoint]` macro. In other words, in actual projects, for reasons such as development progress, you can choose not to generate OpenAPI documentation, or only partially generate it. Later, you can gradually increase the number of OpenAPI interfaces generated, and all you need to do is change the `#[handler]` to `#[endpoint]` and modify the function signature.

## Extractors

By using use salvo::oapi::extract:*;, you can import commonly used data extractors that are pre-built in Salvo. These extractors provide necessary information to Salvo so that it can generate OpenAPI documentation.

- `QueryParam<T, const REQUIRED: bool>`: an extractor that extracts data from query strings. `QueryParam<T, false>` means that this parameter is optional and can be omitted. `QueryParam<T, true>` means that this parameter is required and cannot be omitted. If it is not provided, an error will be returned;

- `HeaderParam<T, const REQUIRED: bool>`: an extractor that extracts data from request headers. `HeaderParam<T, false>` means that this parameter is optional and can be omitted. `HeaderParam<T, true>` means that this parameter is required and cannot be omitted. If it is not provided, an error will be returned;

- `CookieParam<T, const REQUIRED: bool>`: an extractor that extracts data from request cookies. `CookieParam<T, false>` means that this parameter is optional and can be omitted. `CookieParam<T, true>` means that this parameter is required and cannot be omitted. If it is not provided, an error will be returned;

- `PathParam<T>`: an extractor that extracts path parameters from the request URL. If this parameter does not exist, the route matching will not be successful, so there is no case where it can be omitted;

- `FormBody<T>`: an extractor that extracts information from submitted forms;

- `JsonBody<T>`: an extractor that extracts information from JSON-formatted payloads submitted in requests.


## `#[endpoint]` 宏

When generating OpenAPI documentation, the `#[endpoint]` macro needs to be used instead of the regular `#[handler]` macro. It is actually an enhanced version of the `#[handler]` macro.

- It can obtain the necessary information for generating OpenAPI documentation from the function signature.

- For information that is not convenient to provide through the signature, it can be directly added as an attribute in the `#[endpoint]` macro. Information provided in this way will be merged with the information obtained through the function signature. If there is a conflict, the information provided in the attribute will overwrite the information provided through the function signature.

You can use the Rust's own `#[deprecated]` attribute on functions to mark it as deprecated and it will
reflect to the generated OpenAPI spec. Only **parameters** has a special **deprecated** attribute to define them as deprecated.

`#[deprecated]` attribute supports adding additional details such as a reason and or since version but this is is not supported in
OpenAPI. OpenAPI has only a boolean flag to determine deprecation. While it is totally okay to declare deprecated with reason
`#[deprecated  = "There is better way to do this"]` the reason would not render in OpenAPI spec.

Doc comment at decorated function will be used for _`description`_ and _`summary`_ of the path.
First line of the doc comment will be used as the _`summary`_ and the whole doc comment will be
used as _`description`_.

```rust
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[endpoint]
fn endpoint() {}
```


### Error handling

For general applications, we will define a global error type (AppError), and implement `Writer` or `Scribe` for AppError, so that errors can be sent to the client as web page information.

For OpenAPI, in order to achieve the necessary error message, we also need to implement `EndpointOutRegister` for this error:

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

This error centrally defines all error messages that may be returned by the entire web application. However, in many cases, our `Handler` may only contain a few specific error types. At this time, `status_codes` can be used to filter out the required error type information:

```rust
#[endpoint(status_codes(201, 409))]
pub async fn create_todo(new_todo: JsonBody<Todo>) -> Result<StatusCode, Error> {
     Ok(StatusCode::CREATED)
}
```