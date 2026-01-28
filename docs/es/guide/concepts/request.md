# Solicitud

En Salvo, los datos de la solicitud del usuario se pueden obtener a través de [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Vista Rápida
Request es una estructura que representa una solicitud HTTP, proporcionando capacidades integrales de manejo de solicitudes:

* Opera sobre atributos básicos (URI, método, versión)
* Maneja encabezados de solicitud y Cookies
* Analiza varios parámetros (ruta, consulta, formulario)
* Soporta procesamiento del cuerpo de la solicitud y carga de archivos
* Ofrece múltiples métodos de análisis de datos (JSON, formulario, etc.)
* Implementa extracción de datos unificada y segura en tipos mediante el método extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obteniendo Parámetros de Consulta

Los parámetros de consulta se pueden obtener mediante `get_query`:

```rust
req.query::<String>("id");
```

## Obteniendo Datos de Formulario

Los datos de formulario se pueden obtener mediante `get_form`. Esta función es asíncrona:

```rust
req.form::<String>("id").await;
```

## Obteniendo Datos Deserializados en JSON

```rust
req.parse_json::<User>().await;
```

## Extrayendo Datos de la Solicitud

`Request` proporciona múltiples métodos para analizar estos datos en estructuras fuertemente tipadas.

* `parse_params`: Analiza los parámetros de ruta de la solicitud en un tipo de dato específico.
* `parse_queries`: Analiza las consultas de URL de la solicitud en un tipo de dato específico.
* `parse_headers`: Analiza los encabezados HTTP de la solicitud en un tipo de dato específico.
* `parse_json`: Analiza los datos en la parte del cuerpo HTTP de la solicitud en formato JSON a un tipo específico.
* `parse_form`: Analiza los datos en la parte del cuerpo HTTP de la solicitud como un Formulario a un tipo específico.
* `parse_body`: Analiza los datos en la parte del cuerpo HTTP a un tipo específico basado en el `content-type` de la solicitud.
* `extract`: Puede combinar diferentes fuentes de datos para analizar un tipo específico.

## Principio de Análisis

Aquí se utiliza un `serde::Deserializer` personalizado para extraer datos de estructuras como `HashMap<String, String>` y `HashMap<String, Vec<String>>` a tipos de datos específicos.

Por ejemplo: las `consultas de URL` se extraen realmente como un tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` puede considerarse como una estructura de datos similar a `HashMap<String, Vec<String>>`. Si la URL solicitada es `http://localhost/users?id=123&id=234`, y nuestro tipo objetivo es:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Entonces se analizará el primer `id=123`, y `id=234` será descartado:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Si el tipo que proporcionamos es:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Entonces se analizarán ambos `id=123&id=234`:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extractores Integrados
El framework incluye extractores de parámetros de solicitud integrados. Estos extractores pueden simplificar significativamente el código para manejar solicitudes HTTP.

:::tip
Para usarlos, necesitas agregar la característica `"oapi"` en tu `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Luego puedes importar los extractores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Se utiliza para extraer datos JSON del cuerpo de la solicitud y deserializarlos en un tipo especificado.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Usuario creado con ID {}", user.id)
}
```

#### FormBody
Extrae datos de formulario del cuerpo de la solicitud y los deserializa en un tipo especificado.

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
    format!("ID de Usuario desde la Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrae un valor específico de los encabezados de la solicitud.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID de Usuario desde el Encabezado: {}", user_id.into_inner())
}
```

#### PathParam
Extrae parámetros de la ruta de la URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID de Usuario desde la Ruta: {}", id.into_inner())
}
```

#### QueryParam
Extrae parámetros de la cadena de consulta de la URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Buscando usuario con ID: {}", id.into_inner())
}
```

### Extracción desde Depot

Puedes extraer datos de `Depot` que fueron inyectados por middleware. Esto es útil para acceder a información de usuario autenticado u otros datos del ámbito de la solicitud.

```rust
/// Middleware que inyecta datos de usuario en depot
#[handler]
async fn inject_user(depot: &mut Depot) {
    depot.insert("user_id", 123i64);
    depot.insert("username", "alice".to_string());
    depot.insert("is_admin", true);
}

/// Extraer contexto de usuario desde depot
#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "depot")))]
struct UserContext {
    user_id: i64,
    username: String,
    is_admin: bool,
}

#[handler]
async fn protected_handler(user: UserContext) -> String {
    format!("Hola {}, tu ID es {}", user.username, user.user_id)
}

// Configuración del router con middleware
let router = Router::new()
    .hoop(inject_user)
    .push(Router::with_path("protected").get(protected_handler));
```

La extracción de Depot soporta los siguientes tipos:
- `String` y `&'static str`
- Enteros con signo: `i8`, `i16`, `i32`, `i64`, `i128`, `isize`
- Enteros sin signo: `u8`, `u16`, `u32`, `u64`, `u128`, `usize`
- Punto flotante: `f32`, `f64`
- `bool`

También puedes mezclar depot con otras fuentes:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
struct RequestData {
    #[salvo(extract(source(from = "depot")))]
    user_id: i64,
    #[salvo(extract(source(from = "query")))]
    page: i64,
    #[salvo(extract(source(from = "body")))]
    content: String,
}
```

### Uso Avanzado
Puedes combinar múltiples fuentes de datos para analizar un tipo específico. Primero, define un tipo personalizado, por ejemplo:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por defecto, obtiene los valores de los campos desde el cuerpo.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// El id se obtiene de los parámetros de ruta de la solicitud y se analiza automáticamente como i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Se pueden usar tipos de referencia para evitar la copia de memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Luego, en un `Handler`, puedes obtener los datos así:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Incluso puedes pasar el tipo directamente como parámetro de función, así:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Las definiciones de tipos de datos ofrecen una flexibilidad considerable, incluso permitiendo analizar en estructuras anidadas según sea necesario:

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
    /// Este campo anidado se analiza completamente desde la Request nuevamente.
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

Para un ejemplo concreto, ver: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Si en el ejemplo anterior Nested<'a> no tiene campos con los mismos nombres que el padre, puedes usar `#[serde(flatten)]`. De lo contrario, necesitas usar `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

También puedes agregar un parámetro `parse` a `source` para especificar un método de análisis particular. Si este parámetro no se especifica, el análisis se determina basado en la información de la `Request`. Para un cuerpo `Form`, se analiza como `MultiMap`; para una carga útil JSON, se analiza como JSON. Generalmente, no necesitas especificar este parámetro. En casos raros, especificarlo puede habilitar funcionalidades especiales.

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
    let mut req = TestClient::get("http://127.0.0.1:8698/test/1234/param2v")
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

Por ejemplo, aquí la solicitud real envía un Formulario, pero el valor de cierto campo es un texto JSON. Al especificar `parse`, esta cadena se puede analizar en formato JSON.

## Resumen Parcial de la API. Para la información más reciente y detallada, consulta la documentación de la API de crates.
# Resumen de Métodos de la Estructura Request

| Categoría | Método | Descripción |
|----------|--------|-------------|
| **Información de la Solicitud** | `uri()/uri_mut()/set_uri()` | Operaciones de URI |
| | `method()/method_mut()` | Operaciones del método HTTP |
| | `version()/version_mut()` | Operaciones de la versión HTTP |
| | `scheme()/scheme_mut()` | Operaciones del esquema del protocolo |
| | `remote_addr()/local_addr()` | Información de dirección |
| **Encabezados de la Solicitud** | `headers()/headers_mut()` | Obtener todos los encabezados de la solicitud |
| | `header<T>()/try_header<T>()` | Obtener y analizar un encabezado específico |
| | `add_header()` | Agregar un encabezado de solicitud |
| | `content_type()/accept()` | Obtener tipo de contenido/tipo de aceptación |
| **Manejo de Parámetros** | `params()/param<T>()` | Operaciones de parámetros de ruta |
| | `queries()/query<T>()` | Operaciones de parámetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operaciones de datos de formulario |
| **Cuerpo de la Solicitud** | `body()/body_mut()` | Obtener el cuerpo de la solicitud |
| | `replace_body()/take_body()` | Modificar/extraer el cuerpo de la solicitud |
| | `payload()/payload_with_max_size()` | Obtener datos sin procesar |
| **Manejo de Archivos** | `file()/files()/all_files()` | Obtener archivos cargados |
| | `first_file()` | Obtener el primer archivo |
| **Análisis de Datos** | `extract<T>()` | Extracción de datos unificada |
| | `parse_json<T>()/parse_form<T>()` | Analizar JSON/formulario |
| | `parse_body<T>()` | Analizar inteligentemente el cuerpo de la solicitud |
| | `parse_params<T>()/parse_queries<T>()` | Analizar parámetros/consultas |
| **Características Especiales** | `cookies()/cookie()` | Operaciones con Cookies (requiere característica cookie) |
| | `extensions()/extensions_mut()` | Almacenamiento de datos de extensión |
| | `set_secure_max_size()` | Establecer límite de tamaño seguro |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}