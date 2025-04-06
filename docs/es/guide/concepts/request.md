# Solicitud

En Salvo, los datos de la solicitud del usuario se pueden obtener mediante [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Comprensión rápida
Request es una estructura que representa una solicitud HTTP, proporcionando funcionalidades completas para su manejo:

* Manipulación de atributos básicos (URI, método, versión)
* Manejo de cabeceras y Cookies
* Análisis de diversos parámetros (ruta, consulta, formulario)
* Soporte para manejo del cuerpo de la solicitud y carga de archivos
* Ofrece múltiples métodos para analizar datos (JSON, formularios, etc.)
* Permite extracción de datos con seguridad de tipos mediante el método extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obtención de parámetros de consulta

Se pueden obtener parámetros de consulta mediante `get_query`:

```rust
req.query::<String>("id");
```

## Obtención de datos de formulario

Los datos de formulario se pueden obtener con `get_form`, siendo esta una función asíncrona:

```rust
req.form::<String>("id").await;
```

## Obtención de datos deserializados en JSON

```rust
req.parse_json::<User>().await;
```

## Extracción de datos de Request

`Request` proporciona varios métodos para analizar estos datos en estructuras fuertemente tipadas.

* `parse_params`: Analiza los parámetros de ruta del router como un tipo de dato específico;
* `parse_queries`: Analiza las consultas URL como un tipo de dato específico;
* `parse_headers`: Analiza las cabeceras HTTP como un tipo de dato específico;
* `parse_json`: Interpreta los datos del cuerpo HTTP como JSON y los analiza en un tipo específico;
* `parse_form`: Interpreta los datos del cuerpo HTTP como un formulario y los analiza en un tipo específico;
* `parse_body`: Según el `content-type` de la solicitud, analiza los datos del cuerpo HTTP como un tipo específico.
* `extract`: Puede combinar diferentes fuentes de datos para analizarlas en un tipo específico.

## Principio de análisis

Aquí, mediante un `serde::Deserializer` personalizado, se extraen datos como `HashMap<String, String>` y `HashMap<String, Vec<String>>` a tipos de datos específicos.

Por ejemplo: `URL queries` se extrae como un tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), que puede considerarse similar a una estructura de datos como `HashMap<String, Vec<String>>`. Si la URL solicitada es `http://localhost/users?id=123&id=234`, y el tipo objetivo es:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Entonces, el primer `id=123` se analizará, mientras que `id=234` se descartará:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Si el tipo proporcionado es:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Entonces, tanto `id=123` como `id=234` se analizarán:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extractores integrados
El framework incluye extractores de parámetros de solicitud. Estos extractores pueden simplificar significativamente el código para manejar solicitudes HTTP.

:::tip
Para usar los extractores que necesitas, añade el feature `"oapi"` en tu `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Luego puedes importar los extractores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Extrae datos JSON del cuerpo de la solicitud y los deserializa en un tipo especificado.

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
//El segundo parámetro, si es true, hará que into_inner() entre en pánico si el valor no existe; si es false,
//into_inner() devolverá Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID de usuario obtenido de Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam

Extrae un valor específico de las cabeceras de la solicitud.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID de usuario obtenido de cabecera: {}", user_id.into_inner())
}
```

#### PathParam
Extrae parámetros de la ruta URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID de usuario obtenido de ruta: {}", id.into_inner())
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

### Uso avanzado
Puedes combinar múltiples fuentes de datos para analizarlas en un tipo específico. Primero define un tipo personalizado, por ejemplo:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por defecto, obtiene los valores de los campos desde el cuerpo
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// El ID se obtiene de los parámetros de ruta y se analiza automáticamente como i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Se pueden usar tipos de referencia para evitar copias de memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Luego, en el `Handler`, puedes obtener los datos así:

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

La definición de tipos de datos es muy flexible, permitiendo incluso estructuras anidadas según sea necesario:

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
    /// Este campo nested se analiza completamente desde Request.
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

Si en el ejemplo anterior Nested<'a> no tiene campos idénticos al padre, puedes usar `#[serde(flatten)]`; de lo contrario, usa `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

También puedes añadir un parámetro `parse` a `source` para especificar un método de análisis particular. Si no se especifica, el análisis se determinará según la información de `Request`: si es un formulario, se analizará como `MuiltMap`; si es un payload JSON, se analizará como JSON. Generalmente no es necesario especificar este parámetro, excepto en casos muy específicos donde puede habilitar funcionalidades especiales.

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

Por ejemplo, aquí la solicitud real es un Formulario, pero un campo específico contiene texto JSON. Al especificar `parse`, este texto se analizará como JSON.

## Resumen de API, para la información más actualizada y detallada consulta la documentación de la API
# Resumen de métodos de la estructura Request

| Categoría | Método | Descripción |
|-----------|--------|-------------|
| **Información de solicitud** | `uri()/uri_mut()/set_uri()` | Operaciones con URI |
| | `method()/method_mut()` | Operaciones con método HTTP |
| | `version()/version_mut()` | Operaciones con versión HTTP |
| | `scheme()/scheme_mut()` | Operaciones con esquema de protocolo |
| | `remote_addr()/local_addr()` | Información de direcciones |
| **Cabeceras** | `headers()/headers_mut()` | Obtiene todas las cabeceras |
| | `header<T>()/try_header<T>()` | Obtiene y analiza una cabecera específica |
| | `add_header()` | Añade una cabecera |
| | `content_type()/accept()` | Obtiene tipo de contenido/tipo aceptado |
| **Manejo de parámetros** | `params()/param<T>()` | Operaciones con parámetros de ruta |
| | `queries()/query<T>()` | Operaciones con parámetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operaciones con datos de formulario |
| **Cuerpo de solicitud** | `body()/body_mut()` | Obtiene el cuerpo de la solicitud |
| | `replace_body()/take_body()` | Modifica/extrae el cuerpo de la solicitud |
| | `payload()/payload_with_max_size()` | Obtiene datos crudos |
| **Manejo de archivos** | `file()/files()/all_files()` | Obtiene archivos cargados |
| | `first_file()` | Obtiene el primer archivo |
| **Análisis de datos** | `extract<T>()` | Extracción unificada de datos |
| | `parse_json<T>()/parse_form<T>()` | Analiza JSON/formulario |
| | `parse_body<T>()` | Analiza inteligentemente el cuerpo de la solicitud |
| | `parse_params<T>()/parse_queries<T>()` | Analiza parámetros/consultas |
| **Funcionalidades especiales** | `cookies()/cookie()` | Operaciones con Cookies (requiere feature cookie) |
| | `extensions()/extensions_mut()` | Almacenamiento de datos de extensión |
| | `set_secure_max_size()` | Establece límite de tamaño seguro |
