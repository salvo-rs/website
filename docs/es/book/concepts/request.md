# Solicitud (Request)

Para las aplicaciones web es crucial reaccionar a los datos que un cliente envía al servidor. En Salvo esta información la proporciona la solicitud:

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Cadena de Consulta (query string)

Podemos obtener el query desde el objeto de la solicitud:

```rust
req.query::<String>("id");
```

## Formulario (form)

```rust
req.form::<String>("id").await;
```

## Carga de Json (json payload)

```rust
req.parse_json::<User>().await;
```

## extracción de Datos

La solicitud puede ser tipada a otros tipos de estructuras de datos a través de muchas funciones dentro del `Request`.

* `parse_params`: convierte los parámetros de la ruta a un tipo de datos específico;
* `parse_queries`: convierte el query de la URL a un tipo de datos específico;
* `parse_headers`: convierte las cabeceras de una solicitud HTTP dentro de un tipo de datos específico;
* `parse_json`: convierte los datos en el cuerpo de la solicitud HTTP como formato `json` a un tipo de datos específico;
* `parse_form`: convierte los datos en el cuerpo de una solicitud HTTP del tipo form a un tipo de datos específico;
* `parse_body`: convierte los datos en el cuerpo de una solicitud HTTP a un tipo de datos específico de acuerdo con el tipo de dato solicitado `content-type`;
* `extract`: puede combinar diferentes tipos de datos a un tipo de dato específico;

## Principio de Tipado (Parsing principle)

La estructura personalizada `serde::Deserializer` pudiera ser extraída similar a `HashMap<String, String>` y `HashMap<String, Vec<String>>` dentro de un tipo de dato específico.

Por ejemplo: `URL queries` es extraído como [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), `MultiMap` podemos pensar en ello como una estructura de datos como `HashMap<String, Vec<String>>`. Si la URL solicitada es `http://localhost/users?id=123&id=234`, el tipo de destino es:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Entonces el primero `id=123` será tipado, y el segundo será descartado `id=234`:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Si el tipo de datos que tenemos es:

```rust
#[derive(Deserialize)]
struct Users {
  id: Vec<i64>
}
```

Entonces `id=123&id=234` será tipado de la siguiente manera:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extractores incorporados
El marco incluye extractores de parámetros de solicitud. Estos extractores pueden simplificar en gran medida el código para manejar solicitudes HTTP.

#### Requirements

To use the extractors you need to add `"oapi" feature` in your `Cargo.toml`

```rust
salvo = {version = "*", features = ["oapi"]}
```

Then you can import the extractors

```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Se utiliza para extraer datos JSON del cuerpo de la solicitud y deserializarlos en un tipo específico.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Se ha creado un usuario con ID: {}", user.id)
}
```

#### FormBody
Extrae datos de formulario del cuerpo de la solicitud y los deserializa en un tipo específico.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Se ha actualizado el usuario con ID: {}", user.id)
}
```

#### CookieParam
Extrae un valor específico de la Cookie de la solicitud.

```rust
//Cuando el segundo parámetro es true,
//si el valor no existe, into_inner() provocará un pánico.
//Cuando es false, el método into_inner() devuelve Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID de usuario obtenido de la Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrae un valor específico de los encabezados de la solicitud.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID de usuario obtenido del encabezado: {}", user_id.into_inner())
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
    format!("Buscando usuario con ID: {}", id.into_inner())
}
```

### Uso avanzado

Multiples tipos de datos pueden ser mezclados en un tipo de dato específico. Puedes definir un tipo de dato personalizado como el que se encuentra a continuación:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Get the data field value from the body by default.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// The id number is obtained from the request path parameter, and the data is automatically parsed as i64 type.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Reference types can be used to avoid memory copying.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Entonces en el `Handler` puedes obtener los datos como lo siguiente:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Incluso puedes pasar el tipo directamente a la función como parámetro, así:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Existe una flexibilidad considerable en la definición de tipos de datos e incluso se pueden resolver en estructuras anidadas según sea necesario:

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
    /// The nested field is completely reparsed from Request.
    #[salvo(extract(source(from = "request")))]
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

Para ejemplos específicos, puedes ver: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Si en el ejemplo anterior Nested<'a> no tiene los mismos campos que el padre, puedes usar `#[serde(flatten)]`, de lo contrario necesitas usar `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

De hecho, también puedes agregar un `parse` al `source` para especificar el tipo de dato. Si no especifica este parámetro, el análisis determinará el método de análisis de la parte `body` en función de la información del `request`. Si es un formulario `Form`, se analizará de acuerdo con el método `MuiltMap`. Si se trata de una carga útil json, se analizará según el formato json. Generalmente, no es necesario especificar este parámetro. En casos excepcionales, especificar este parámetro puede lograr algunas funciones especiales.

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

Por ejemplo, la solicitud real aquí es Formulario, pero el valor de un determinado campo es un texto json. En este momento, puede especificar `parse` para analizar la cadena en formato json.
