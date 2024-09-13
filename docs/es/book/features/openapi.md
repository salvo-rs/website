# OpenAPI

OpenAPI es una especificación de código abierto que se utiliza para describir el diseño de interfaz de las API RESTful. Define los detalles de la estructura, parámetros, tipos de retorno, códigos de error y otros aspectos de las solicitudes y respuestas API en formato JSON o YAML, haciendo que la comunicación entre clientes y servidores sea más clara y estandarizada.

Inicialmente desarrollado como una versión de código abierto de la especificación Swagger, OpenAPI ahora se ha convertido en un proyecto independiente y ha obtenido el apoyo de muchas grandes empresas y desarrolladores. El uso de la especificación OpenAPI puede ayudar a los equipos de desarrollo a colaborar mejor, reducir los costos de comunicación y mejorar la eficiencia del desarrollo. Además, OpenAPI proporciona a los desarrolladores herramientas como generación automática de documentación API, datos simulados y casos de prueba para facilitar el trabajo de desarrollo y prueba.

Salvo proporciona integración con OpenAPI (adaptado de utoipa).

Dado que los nombres de tipo de Rust son largos y pueden no ser adecuados para OpenAPI, `salvo-oapi` proporciona el tipo `Namer`, que puede personalizar las reglas y cambiar el nombre del tipo en OpenAPI según sea necesario.

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/oapi-hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/oapi-hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

PAra ver la interfáz de Swagger, escribe en tu navegador lo siguiente: <http://localhost:5800/swagger-ui>.

La integración de OpenAPI en Salvo es bastante elegante. Para el ejemplo anterior, en comparación con un proyecto Salvo normal, solo necesitamos seguir los siguientes pasos:

- Habilita la característica oapien el archivo `Cargo.toml`: `salvo = { workspace = true, features = ["oapi"] }`;

- Reemplaza `#[handler]` por `#[endpoint]`;

- Usa el nombre: `QueryParam<String, false>` para obtener el valor del string consultado. Cuando visitas `http://localhost/hello?name=chris`, la consulta será tipada como corresponde. El valor falso aquí indica que este parámetro es opcional. Si visita `http://localhost/hello` sin el parámetro de nombre, no provocará un error. Por el contrario, si es `QueryParam<String, true>`, significa que este parámetro es obligatorio y se devolverá un error si no se proporciona.

- Cree una OpenAPI y cree el enrutador correspondiente. `OpenApi::new("test api", "0.0.1").merge_router(&router)` aquí merge_router significa que esta OpenAPI obtiene la información de documentación necesaria analizando una determinada ruta y sus rutas descendientes. Es posible que algunas rutas no proporcionen información para generar documentación y estas rutas se ignorarán, como el controlador definido usando la macro `#[handler]` en lugar de la macro `#[endpoint]`. En otras palabras, en proyectos reales, por razones como el progreso del desarrollo, puede optar por no generar documentación OpenAPI o generarla solo parcialmente. Más adelante, puede aumentar gradualmente la cantidad de interfaces OpenAPI generadas y todo lo que necesita hacer es cambiar `#[handler]` a `#[endpoint]` y modificar la firma de la función.

## Extractores

Al utilizar `use salvo::oapi::extract:*;`, puede importar extractores de datos de uso común que están prediseñados en Salvo. Estos extractores proporcionan la información necesaria a Salvo para que pueda generar documentación OpenAPI.

- `QueryParam<T, const REQUIRED: bool>`: un extractor que extrae datos de cadenas de consulta. `QueryParam<T, false>` significa que este parámetro es opcional y se puede omitir. `QueryParam<T, true>` significa que este parámetro es obligatorio y no se puede omitir. Si no se proporciona, se devolverá un error;

- `HeaderParam<T, const REQUIRED: bool>`: un extractor que extrae datos de los encabezados de solicitud. `HeaderParam<T, false>` significa que este parámetro es opcional y se puede omitir. `HeaderParam<T, true>` significa que este parámetro es obligatorio y no se puede omitir. Si no se proporciona, se devolverá un error;

- `CookieParam<T, const REQUIRED: bool>`: un extractor que extrae datos de las cookies de solicitud. `CookieParam<T, false>` significa que este parámetro es opcional y se puede omitir. `CookieParam<T, true>` significa que este parámetro es obligatorio y no se puede omitir. Si no se proporciona, se devolverá un error;

- `PathParam<T>`: un extractor que extrae los parámetros de ruta de la URL de solicitud. Si este parámetro no existe, la coincidencia de ruta no será exitosa, por lo que no se puede omitir en ningún caso;

- `FormBody<T>`: un extractor que extrae información de los formularios enviados;

- `JsonBody<T>`: un extractor que extrae información de cargas útiles con formato JSON enviadas en solicitudes.

## `#[endpoint]`

Al generar documentación de OpenAPI, se debe utilizar la macro `#[endpoint]` en lugar de la macro normal `#[handler]`. En realidad, es una versión mejorada de la macro `#[handler]`.

- Puede obtener la información necesaria para generar documentación OpenAPI a partir de la firma de la función.

- Para información que no sea conveniente proporcionar a través de la firma, se puede agregar directamente como atributo en la macro `#[endpoint]`. La información proporcionada de esta manera se fusionará con la información obtenida a través de la firma de la función. Si hay un conflicto, la información proporcionada en el atributo sobrescribirá la información proporcionada a través de la firma de la función.

Puede usar el atributo `#[deprecated]` propio de Rust en funciones para marcarlo como obsoleto y lo hará
reflejar la especificación OpenAPI generada. Solo **parámetros** tiene un atributo especial **obsoleto** para definirlos como obsoletos.

El atributo `#[obsoleto]` admite agregar detalles adicionales, como un motivo o desde la versión, pero esto no se admite en
API abierta. OpenAPI solo tiene un indicador booleano para determinar la desaprobación. Si bien está totalmente bien declararlo obsoleto con razón
`#[deprecated = "Hay una mejor manera de hacer esto"]` el motivo no se representaría en la especificación OpenAPI.

El comentario del documento en la función decorada se utilizará para _`description`_ y _`summary`_ de la ruta.
La primera línea del comentario del documento se utilizará como _`summary`_ y el comentario completo del documento se
utilizado como _`description`_.

```rust
/// This is a summary of the operation
///
/// All lines of the doc comment will be included to operation description.
#[endpoint]
fn endpoint() {}
```

## Parámetros

Genere [parámetros de ruta] [path parameters][path_parameters] a partir de los campos de la estructura.

Esta es la implementación `#[derive]` para el rasgo [`ToParameters`][to_parameters].

Normalmente, los parámetros de ruta deben definirse dentro de la sección [`#[salvo_oapi::endpoint(...parameters(...))]`][path_parameters]
para el punto final. Pero este rasgo elimina la necesidad de hacerlo cuando se usan [`struct`][struct]s para definir parámetros.
Aún es necesario definir los parámetros de ruta [`std::primitive`][primitive] y [`String`][std_string] o los parámetros de ruta de estilo [`tuple`]
dentro de la sección `parámetros(...)` si es necesario proporcionar una descripción u otra configuración que no sea la predeterminada.

Puede utilizar el atributo `#[deprecated]` de Rust en el campo para marcarlo como
está en desuso y se reflejará en la especificación OpenAPI generada.

El atributo `#[deprecated]` admite agregar detalles adicionales como un motivo o desde la versión
pero esto no es compatible con OpenAPI. OpenAPI solo tiene un indicador booleano para determinar la desaprobación.
Si bien está totalmente bien declararlo obsoleto con razón
`#[deprecated = "Hay una mejor manera de hacer esto"]` el motivo no se representaría en la especificación OpenAPI.

El comentario del documento en los campos de estructura se utilizará como descripción de los parámetros generados.

```rust
#[derive(salvo_oapi::ToParameters, serde::Deserialize)]
struct Query {
    /// Query todo items by name.
    name: String
}
```

### Parámetros Contenedores de Atributos `#[salvo(parameters(...))]`

Los siguienes atributos están disponibles para usar en el contenedor de atributos `#[salvo(parameters(...))]` para la estructura derivando `ToParameters`:

- `names(...)` Defina una lista de nombres separados por comas para los campos sin nombre de la estructura utilizada como parámetro de ruta.
   **Solo** soportado en **estructuras sin nombre**.
- `style = ...` Define cómo se serializan todos los parámetros mediante [`ParameterStyle`][style]. Por defecto
   los valores se basan en el atributo _`parameter_in`_.
- `default_parameter_in = ...` =  Define el valor predeterminado donde se utilizan los parámetros de este campo con un valor de
   [`parameter::ParameterIn`][in_enum]. Si no se proporciona este atributo, entonces el valor predeterminado proviene de la consulta.
- `rename_all = ...` Se puede proporcionar como alternativa al atributo `rename_all` del serde. Proporciona efectivamente la misma funcionalidad.

Utilice `names` para definir el nombre de un único argumento sin nombre.

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id")))]
struct Id(u64);
```

Use `names` para definir múltiples argumentos sin nombre.

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(names("id", "name")))]
struct IdAndName(u64, String);
```

### Parámetros para Campos de Atributos `#[salvo(parameter(...))]`

Los siguientes atributos están disponibles para su uso en el `#[salvo(parameter(...))]` en campos de estructura:

- `style = ...` Define cómo se serializa el parámetro mediante [`ParameterStyle`][style]. Los valores predeterminados se basan en el atributo _`parameter_in`_.

- `parameter_in = ...` =  Define dónde se utilizan los parámetros de este campo con un valor de
   [`parameter::ParameterIn`][in_enum]. Si no se proporciona este atributo, entonces el valor predeterminado proviene de la consulta.

- `explode` Define nuevo si _`parameter=value`_ Se crea un par para cada parámetro dentro de _`object`_ o _`array`_.

- `allow_reserved` Define si los caracteres reservados _`:/?#[]@!$&'()*+,;=`_ está permitido dentro del valor.

- `example = ...` Puede ser una referencia de método o _`json!(...)`_. Ejemplo dado
  anulará cualquier ejemplo en el tipo de parámetro subyacente.

- `value_type = ...` Se puede utilizar para anular el tipo predeterminado derivado del tipo de campo utilizado en la especificación OpenAPI.
  Esto es útil en casos en los que el tipo predeterminado no corresponde al tipo real, p. cuando
  Se utilizan tipos de terceros que no son [`ToSchema`][to_schema] ni [`tipos primitivos`][primitive].
   El valor puede ser cualquier tipo de Rust que normalmente podría usarse para serializar a JSON o un tipo personalizado como _`Object`_.
   _`Object`_ se representará como un objeto OpenAPI genérico.

- `inline` Si se establece, el esquema para el tipo de este campo debe ser [`ToSchema`][to_schema], y
  la definición del esquema estará incorporada.

- `default = ...` Puede ser una referencia de método o _`json!(...)`_.

- `format = ...` Puede ser una variante de la enumeración [`KnownFormat`][known_format] o no
  un valor abierto como una cadena. Por defecto, el formato se deriva del tipo de propiedad.
  según las especificaciones de OpenApi.

- `write_only` Define que la propiedad solo se usa en operaciones de **escritura** **POST,PUT,PATCH** pero no en **GET**

- `read_only` Define que la propiedad solo se usa en operaciones de **lectura** **GET** pero no en **POST,PUT,PATCH**

- `nullable` Define que la propiedad admite valores NULL (tenga en cuenta que esto es diferente a no obligatorio).

- `required = ...` Se puede utilizar para imponer el estado requerido para el parámetro. [Ver reglas](https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/derive.ToParameters.html#field-nullability-and-required-rules)

- `rename = ...` Se puede proporcionar como alternativa al atributo `rename` del serde. Proporciona efectivamente la misma funcionalidad.

- `multiple_of = ...` Se puede utilizar para definir el multiplicador de un valor. El valor se considera válido.
  La división dará como resultado un "número entero". El valor debe estar estrictamente por encima de _`0`_.

- `maximum = ...` Se puede utilizar para definir el límite superior inclusivo de un valor `número`.

- `minimum = ...` Se puede utilizar para definir un límite inferior inclusivo para un valor `número`.

- `exclusive_maximum = ...` Se puede utilizar para definir un límite superior exclusivo para un valor `número`.

- `exclusive_minimum = ...` Se puede utilizar para definir un límite inferior exclusivo para un valor `número`.

- `max_length = ...` Se puede utilizar para definir la longitud máxima para tipos de `cadena`.

- `min_length = ...` Se puede utilizar para definir la longitud mínima para los tipos de `cadena`.

- `patrón = ...` Se puede utilizar para definir una expresión regular válida en el dialecto _ECMA-262_ y el valor del campo debe coincidir.

- `max_items = ...` Se puede utilizar para definir el número máximo de elementos permitidos para los campos de `matriz`. El valor debe
  ser un número entero no negativo.

- `min_items = ...` Se puede utilizar para definir los elementos mínimos permitidos para los campos de `matriz`. El valor debe
  ser un número entero no negativo.

- `with_schema = ...` Use _`schema`_ creado por la referencia de función proporcionada en lugar del
  _`esquema`_ derivado por defecto. La función debe coincidir con `fn() -> Into<RefOr<Schema>>`. Lo hace
  no acepta argumentos y debe devolver cualquier cosa que pueda convertirse en `RefOr<Schema>`.

- `additional_properties = ...` Se puede utilizar para definir tipos de formato libre para mapas como
  [`HashMap`](https://doc.rust-lang.org/std/collections/hash_map/struct.HashMap.html) y [`BTreeMap`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html).
  El tipo de formato libre permite el uso de tipos arbitrarios dentro de los valores del mapa.
  Admite formatos _`additional_properties`_ y _`additional_properties = true`_.

#### Anulación de campos y reglas requeridas

SSe aplican las mismas reglas de nulidad y estado requerido para los atributos de campo _`ToParameters`_ que para

_`ToSchema`_ atributos del campo. [Ver las reglas](https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/derive.ToSchema.html#field-nullability-and-required-rules).

### Soporte parcial de atributos `#[serde(...)]`

ToParameters derive has partial support for [serde attributes][serde attributes]. These supported attributes will reflect to the
generated OpenAPI doc. The following attributes are currently supported:

- `rename_all = "..."` Apoyado a nivel del contenedor.
- `rename = "..."` Compatible **sólo** a nivel de campo.
- `default` Soportado a nivel de contenedor y a nivel de campo según [atributos del servidor][serde attributes].
- `skip_serializing_if = "..."` Compatible **sólo** a nivel de campo.
- `with = ...` Compatible **sólo** a nivel de campo.
- `skip_serializing = "..."` Compatible **solo** a nivel de campo o variante.
- `skip_deserializing = "..."` Compatible **solo** a nivel de campo o variante.
- `skip = "..."` Compatible **sólo** a nivel de campo.

Otros atributos _`serde`_ afectarán la serialización pero no se reflejarán en el documento OpenAPI generado.

### Ejemplos

_**Demostrar el uso de [`ToParameters`][to_parameters] con el atributo de contenedor `#[salvo(parameters(...))]` para
usarse como consulta de ruta e incluir un campo de consulta de esquema:**_

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

_**Sobrescribir `String` con `i64` usando atributos `value_type`**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = i64))]
    id: String,
}
```

_**Sobrescribir `String` con `Object` usando atributos `value_type`. `Object` se verá como `type: object` en la especificación de OpenAPI.**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Object))]
    id: String,
}
```

_**Puede utilizar un tipo genérico para anular el tipo predeterminado del campo.**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Option<String>))]
    id: String
}
```

_**Incluso puedes anular un [`Vec`] con otro.**_

```rust
# use salvo_oapi::ToParameters;

#[derive(ToParameters, serde::Deserialize)]
#[salvo(parameters(default_parameter_in = Query))]
struct Filter {
    #[salvo(parameter(value_type = Vec<i32>))]
    id: Vec<String>
}
```

_**Podemos anular el valor con otro [`ToSchema`][to_schema].**_

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

_**Ejemplo con atributos de validación.**_

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

_**Utilice `schema_with` para implementar manualmente el esquema de un campo.**_

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

- `rename_all = ...`: admite una sintaxis similar a `serde` para definir reglas para cambiar el nombre de los campos. Si se definen tanto `#[serde(rename_all = "...")]` como `#[salvo(schema) al mismo tiempo (rename_all = "..."))]`, entonces se prefiere `#[serde(rename_all = "...")]`.

- `symbol = ...`: una cadena literal utilizada para definir la ruta del nombre de la estructura en OpenAPI. Por ejemplo, `#[salvo(schema(symbol = "path.to.Pet"))]`.

- `default`: Se puede utilizar para completar los valores predeterminados en todos los campos utilizando la implementación predeterminada de la estructura.

### Manejo de errores

Para aplicaciones generales, definiremos un tipo de error global (AppError) e implementaremos `Writer` o `Scribe` para AppError, de modo que los errores puedan enviarse al cliente como información de la página web.

Para OpenAPI, para lograr el mensaje de error necesario, también necesitamos implementar `EndpointOutRegister` para este error:

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

Este error define centralmente todos los mensajes de error que puede devolver toda la aplicación web. Sin embargo, en muchos casos, nuestro `Handler` puede contener solo unos pocos tipos de error específicos. En este momento, `status_codes` se puede utilizar para filtrar los información de tipo de error requerida:

```rust
#[endpoint(status_codes(201, 409))]
pub async fn create_todo(new_todo: JsonBody<Todo>) -> Result<StatusCode, Error> {
     Ok(StatusCode::CREATED)
}
```

[to_schema]: https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/trait.ToSchema.html
[known_format]: https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/enum.KnownFormat.html
<!-- [xml]: openapi/xml/struct.Xml.html -->
[to_parameters]: https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/trait.ToParameters.html
[path_parameters]: openapi.html#parameters-attributes
[struct]: https://doc.rust-lang.org/std/keyword.struct.html
[style]: https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/enum.ParameterStyle.html
[in_enum]: https://docs.rs/salvo-oapi/0.71.1/salvo_oapi/enum.ParameterIn.html
[primitive]: https://doc.rust-lang.org/std/primitive/index.html
[serde attributes]: https://serde.rs/attributes.html
[std_string]: https://doc.rust-lang.org/std/string/struct.String.html
