# Request

En Salvo, los datos de la solicitud del usuario se pueden obtener a través de [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Comprensión Rápida
Request es una estructura que representa una solicitud HTTP y proporciona funcionalidades integrales para su procesamiento:

* Permite operar atributos básicos (URI, método, versión)
* Maneja cabeceras y Cookies
* Analiza varios tipos de parámetros (ruta, consulta, formulario)
* Soporta procesamiento del cuerpo de la solicitud y carga de archivos
* Ofrece múltiples métodos para analizar datos (JSON, formularios, etc.)
* Implementa una extracción unificada de datos con seguridad de tipos mediante el método extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obtener Parámetros de Consulta

Se pueden obtener los parámetros de consulta mediante `get_query`:

```rust
req.query::<String>("id");
```

## Obtener Datos de Formulario

Se pueden obtener los parámetros de consulta mediante `get_form`. Esta función es asíncrona:

```rust
req.form::<String>("id").await;
```

## Obtener Datos Deserializados JSON

```rust
req.parse_json::<User>().await;
```

## Extraer Datos de la Request

`Request` proporciona múltiples métodos para analizar estos datos en estructuras fuertemente tipadas.

* `parse_params`: Analiza los parámetros de ruta (router params) de la solicitud en un tipo de dato específico.
* `parse_queries`: Analiza los parámetros de consulta (URL queries) de la solicitud en un tipo de dato específico.
* `parse_headers`: Analiza las cabeceras HTTP de la solicitud en un tipo de dato específico.
* `parse_json`: Analiza los datos de la parte del cuerpo (body) de la solicitud HTTP como formato JSON a un tipo específico.
* `parse_form`: Analiza los datos de la parte del cuerpo (body) de la solicitud HTTP como un formulario (Form) a un tipo específico.
* `parse_body`: Analiza los datos de la parte del cuerpo (body) de la solicitud HTTP a un tipo específico, según el `content-type` de la solicitud.
* `extract`: Puede combinar diferentes fuentes de datos para analizar y extraer un tipo específico.

## Principio de Análisis

Aquí, se utiliza un `serde::Deserializer` personalizado para extraer datos de estructuras como `HashMap<String, String>` y `HashMap<String, Vec<String>>` a tipos de datos específicos.

Por ejemplo: `URL queries` se extrae esencialmente como un tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` puede considerarse una estructura de datos similar a `HashMap<String, Vec<String>>`. Si la URL de la solicitud es `http://localhost/users?id=123&id=234` y nuestro tipo objetivo es:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Entonces, el primer `id=123` será analizado, y `id=234` será descartado:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Si nuestro tipo proporcionado es:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Entonces ambos `id=123&id=234` serán analizados:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extractores Integrados
El framework incluye extractores de parámetros de solicitud. Estos extractores pueden simplificar enormemente el código para manejar solicitudes HTTP.

:::tip
Para usar los extractores, necesitas agregar el feature `"oapi"` en tu `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Luego puedes importar los extractores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Se utiliza para extraer datos JSON del cuerpo de la solicitud y deserializarlos a un tipo especificado.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Usuario creado con ID {}", user.id)
}
```

#### FormBody
Extrae datos de formulario del cuerpo de la solicitud y los deserializa a un tipo especificado.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Usuario actualizado con ID {}", user.id)
}
```

#### CookieParam
Extrae un valor específico de las Cookies de la solicitud.

```rust
// El segundo parámetro: si es true, into_inner() entrará en pánico si el valor no existe.
// Si es false, into_inner() devuelve Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID de usuario obtenido de la Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam

Extrae un valor específico de las cabeceras de la solicitud.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID de usuario obtenido de la cabecera: {}", user_id.into_inner())
}
```

#### PathParam
Extrae parámetros de la ruta URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID de usuario obtenido de la ruta: {}", id.into_inner())
}
```

#### QueryParam
Extrae parámetros de la cadena de consulta URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Buscando usuario con ID {}", id.into_inner())
}
```

### Uso Avanzado
Se pueden combinar múltiples fuentes de datos para analizar un tipo específico. Primero, puedes definir un tipo personalizado, por ejemplo:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por defecto, obtiene los valores de los campos desde el body.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// El id se obtiene del parámetro de ruta y se analiza automáticamente como i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Se pueden usar tipos de referencia para evitar copias de memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Luego, en el `Handler` puedes obtener los datos así:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Incluso puedes pasar el tipo directamente como parámetro a la función, así:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

La definición de tipos de datos es bastante flexible, permitiendo incluso estructuras anidadas según sea necesario:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    #[salvo(extract(source(from = "param")))]
    id: i64,
    #[salvo(extract(source(from = "query")))]
    username: &'a str,
    first_name: String,
    last_name: String,
    lovers: Vec<String>,
    /// Este campo 'nested' se analiza completamente desde la Request.
    #[salvo(extract(flatten))]
    nested: Nested<'a>,
}

#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct Nested<'a> {
    #[salvo(extract(source(from = "param")))]
    id: i64,
    #[salvo(extract(source(from = "query")))]
    username: &'a str,
    first_name: String,
    last_name: String,
    #[salvo(extract(rename = "lovers"))]
    #[serde(default)]
    pets: Vec<String>,
}
```

Para un ejemplo concreto, consulta: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Si en el ejemplo anterior Nested<'a> no tiene campos idénticos a su padre, puedes usar `#[serde(flatten)`. De lo contrario, necesitas usar `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

También se puede agregar un parámetro `parse` a `source` para especificar un método de análisis particular. Si no se especifica este parámetro, el análisis se decide según la información de la `Request`: para cuerpos de tipo formulario (`Form`), se analiza como `MultiMap`; para payloads JSON, se analiza como JSON. Generalmente no es necesario especificar este parámetro, pero en casos excepcionales puede habilitar funcionalidades especiales.

```rust
#[tokio::test]
async fn test_de_request_with_form_json_str() {
    #[derive(Deserialize, Eq, PartialEq, Debug)]
    struct User<'a> {
        name: &'a str,
        age: usize,
    }
    #[derive(Deserialize, Extractible, Eq, PartialEq, Debug)]
    #[salvo(extract(default_source(from = "body", parse = "json")))]
    struct RequestData<'a> {
        #[salvo(extract(source(from = "param")))]
        p2: &'a str,
        user: User<'a>,
    }
    let mut req = TestClient::get("http://127.0.0.1:5800/test/1234/param2v")
        .raw_form(r#"user={"name": "chris", "age": 20}"#)
        .build();
    req.params.insert("p2".into(), "921".into());
    let data: RequestData = req.extract().await.unwrap();
    assert_eq!(
        data,
        RequestData {
            p2: "921",
            user: User { name: "chris", age: 20 }
        }
    );
}
```

Por ejemplo, aquí la solicitud real envía un Form, pero el valor de un campo específico es un texto JSON. En este caso, especificando `parse`, se puede analizar esa cadena como JSON.

## Vista General de Algunas APIs. Para la información más reciente y detallada, consulta la documentación de la crate.
# Resumen de Métodos de la Estructura Request

| Categoría | Método | Descripción |
|------|------|------|
| **Información de la Solicitud** | `uri()/uri_mut()/set_uri()` | Operaciones con URI |
| | `method()/method_mut()` | Operaciones con método HTTP |
| | `version()/version_mut()` | Operaciones con versión HTTP |
| | `scheme()/scheme_mut()` | Operaciones con esquema de protocolo |
| | `remote_addr()/local_addr()` | Información de direcciones |
| **Cabeceras de Solicitud** | `headers()/headers_mut()` | Obtener todas las cabeceras |
| | `header<T>()/try_header<T>()` | Obtener y analizar una cabecera específica |
| | `add_header()` | Agregar una cabecera |
| | `content_type()/accept()` | Obtener tipo de contenido/tipo aceptado |
| **Procesamiento de Parámetros** | `params()/param<T>()` | Operaciones con parámetros de ruta |
| | `queries()/query<T>()` | Operaciones con parámetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operaciones con datos de formulario |
| **Cuerpo de la Solicitud** | `body()/body_mut()` | Obtener el cuerpo de la solicitud |
| | `replace_body()/take_body()` | Modificar/extraer el cuerpo de la solicitud |
| | `payload()/payload_with_max_size()` | Obtener datos en bruto |
| **Procesamiento de Archivos** | `file()/files()/all_files()` | Obtener archivos cargados |
| | `first_file()` | Obtener el primer archivo |
| **Análisis de Datos** | `extract<T>()` | Extracción unificada de datos |
| | `parse_json<T>()/parse_form<T>()` | Analizar JSON/formulario |
| | `parse_body<T>()` | Análisis inteligente del cuerpo de la solicitud |
| | `parse_params<T>()/parse_queries<T>()` | Analizar parámetros/consultas |
| **Funcionalidades Especiales** | `cookies()/cookie()` | Operaciones con Cookies (requiere feature cookie) |
| | `extensions()/extensions_mut()` | Almacenamiento de datos de extensión |
| | `set_secure_max_size()` | Establecer límite de tamaño seguro |
{/* Auto generated, origin file hash:6b654f79df08ba1dc5cc1c070780def0 */}