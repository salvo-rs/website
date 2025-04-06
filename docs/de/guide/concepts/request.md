# Anfrage

In Salvo können Benutzeranfragedaten über [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) abgerufen werden:

### Schnelles Verständnis

Request ist eine Struktur, die eine HTTP-Anfrage darstellt und umfassende Funktionen zur Anfrageverarbeitung bietet:

- Bearbeitung grundlegender Attribute (URI, Methode, Version)
- Verwaltung von Anfrageheadern und Cookies
- Analyse verschiedener Parameter (Pfad, Abfrage, Formular)
- Unterstützung für Anfragekörperverarbeitung und Dateiupload
- Bereitstellung verschiedener Datenanalysemethoden (JSON, Formular usw.)
- Einheitliche typsichere Datenextraktion über die extract-Methode

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Abfrageparameter abrufen

Abfrageparameter können mit `get_query` abgerufen werden:

```rust
req.query::<String>("id");
```

## Formulardaten abrufen

Formulardaten können mit `get_form` abgerufen werden, diese Funktion ist asynchron:

```rust
req.form::<String>("id").await;
```

## JSON-Daten deserialisieren

```rust
req.parse_json::<User>().await;
```

## Daten aus der Anfrage extrahieren

`Request` bietet mehrere Methoden, um diese Daten in stark typisierte Strukturen zu parsen.

- `parse_params`: Parst die Router-Parameter der Anfrage in einen bestimmten Datentyp;
- `parse_queries`: Parst die URL-Abfragen der Anfrage in einen bestimmten Datentyp;
- `parse_headers`: Parst die HTTP-Header der Anfrage in einen bestimmten Datentyp;
- `parse_json`: Parst die Daten des HTTP-Body-Teils der Anfrage als JSON in einen bestimmten Typ;
- `parse_form`: Parst die Daten des HTTP-Body-Teils der Anfrage als Formular in einen bestimmten Typ;
- `parse_body`: Parst die Daten des HTTP-Body-Teils der Anfrage basierend auf dem `content-type` in einen bestimmten Typ;
- `extract`: Kann verschiedene Datenquellen kombinieren, um einen bestimmten Typ zu extrahieren.

## Parsing-Prinzip

Hier werden Daten wie `HashMap<String, String>` und `HashMap<String, Vec<String>>` mithilfe eines benutzerdefinierten `serde::Deserializer` in bestimmte Datentypen extrahiert.

Zum Beispiel: `URL queries` werden tatsächlich als [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html)-Typ extrahiert, der als ähnlich zu `HashMap<String, Vec<String>>` betrachtet werden kann. Wenn die angeforderte URL `http://localhost/users?id=123&id=234` ist und der Zieltyp:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

dann wird das erste `id=123` geparst, während `id=234` verworfen wird:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Wenn der bereitgestellte Typ jedoch:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

dann werden sowohl `id=123` als auch `id=234` geparst:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Integrierte Extractor

Das Framework bietet integrierte Extraktoren für Anfrageparameter. Diese Extraktoren können den Code zur Verarbeitung von HTTP-Anfragen erheblich vereinfachen.

:::tip
Um die Extraktoren zu verwenden, müssen Sie das Feature `"oapi"` in Ihrer `Cargo.toml` hinzufügen:

```rust
salvo = {version = "*", features = ["oapi"]}
```

:::

Dann können Sie die Extraktoren importieren:

```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody

Extrahiert JSON-Daten aus dem Anfragekörper und deserialisiert sie in einen bestimmten Typ.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Benutzer mit ID {} wurde erstellt", user.id)
}
```

#### FormBody

Extrahiert Formulardaten aus dem Anfragekörper und deserialisiert sie in einen bestimmten Typ.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Benutzer mit ID {} wurde aktualisiert", user.id)
}
```

#### CookieParam

Extrahiert einen bestimmten Wert aus den Cookies der Anfrage.

```rust
// Der zweite Parameter bestimmt, ob into_inner() panic auslöst, wenn der Wert nicht existiert (true),
// oder ein Option<T> zurückgibt (false).
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("Benutzer-ID aus Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam

Extrahiert einen bestimmten Wert aus den Headern der Anfrage.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("Benutzer-ID aus Header: {}", user_id.into_inner())
}
```

#### PathParam

Extrahiert Parameter aus dem URL-Pfad.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("Benutzer-ID aus Pfad: {}", id.into_inner())
}
```

#### QueryParam

Extrahiert Parameter aus der URL-Abfragezeichenfolge.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Suche nach Benutzer mit ID: {}", id.into_inner())
}
```

### Fortgeschrittene Verwendung

Sie können mehrere Datenquellen kombinieren, um einen bestimmten Typ zu extrahieren. Definieren Sie zunächst einen benutzerdefinierten Typ, z.B.:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Standardmäßig werden Datenfelder aus dem Body abgerufen
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Die ID wird aus den Pfadparametern der Anfrage abgerufen und automatisch als i64 geparst.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Referenztypen können verwendet werden, um Speicherkopien zu vermeiden.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Dann können Sie die Daten im `Handler` wie folgt abrufen:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Oder Sie können den Typ direkt als Parameter an die Funktion übergeben:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Die Definition von Datentypen ist sehr flexibel und kann sogar verschachtelte Strukturen parsen:

```rust
{`
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
    /// Dieses verschachtelte Feld wird vollständig aus der Anfrage geparst.
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
`}
```

Ein konkretes Beispiel finden Sie unter: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`
Wenn im obigen Beispiel Nested<'a> keine Felder hat, die mit den übergeordneten Feldern übereinstimmen, können Sie `#[serde(flatten)]` verwenden, andernfalls müssen Sie `#[salvo(extract(flatten))]` verwenden.
### `#[salvo(extract(source(parse)))]`

Sie können dem `source` auch einen `parse`-Parameter hinzufügen, um eine bestimmte Parsing-Methode anzugeben. Wenn dieser Parameter nicht angegeben wird, entscheidet das Parsing basierend auf den Informationen der `Request`, ob der `Body`-Teil als `MuiltMap` oder als JSON geparst wird. In den meisten Fällen ist dieser Parameter nicht erforderlich, aber in seltenen Fällen kann er spezielle Funktionen ermöglichen.

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

Hier wird beispielsweise ein Formular gesendet, aber ein Feld enthält einen JSON-Text. Durch Angabe von `parse` kann dieser String als JSON geparst werden.

## Teilweise API-Übersicht, für die neuesten und detailliertesten Informationen siehe die creates API-Dokumentation

# Überblick über die Methoden der Request-Struktur

| Kategorie                 | Methode                                | Beschreibung                                  |
| ------------------------- | -------------------------------------- | --------------------------------------------- |
| **Anfrageinformation**    | `uri()/uri_mut()/set_uri()`            | URI-Operationen                               |
|                           | `method()/method_mut()`                | HTTP-Methodenoperationen                      |
|                           | `version()/version_mut()`              | HTTP-Versionsoperationen                      |
|                           | `scheme()/scheme_mut()`                | Protokollschemenoperationen                   |
|                           | `remote_addr()/local_addr()`           | Adressinformationen                           |
| **Anfrageheader**         | `headers()/headers_mut()`              | Alle Anfrageheader abrufen                    |
|                           | `header<T>()/try_header<T>()`          | Bestimmten Header abrufen und parsen          |
|                           | `add_header()`                         | Header hinzufügen                             |
|                           | `content_type()/accept()`              | Inhaltstyp/Akzeptanztyp abrufen               |
| **Parameterverarbeitung** | `params()/param<T>()`                  | Pfadparameteroperationen                      |
|                           | `queries()/query<T>()`                 | Abfrageparameteroperationen                   |
|                           | `form<T>()/form_or_query<T>()`         | Formulardatenoperationen                      |
| **Anfragekörper**         | `body()/body_mut()`                    | Anfragekörper abrufen                         |
|                           | `replace_body()/take_body()`           | Anfragekörper ändern/extrahiere               |
|                           | `payload()/payload_with_max_size()`    | Rohdaten abrufen                              |
| **Dateiverarbeitung**     | `file()/files()/all_files()`           | Hochgeladene Dateien abrufen                  |
|                           | `first_file()`                         | Erste Datei abrufen                           |
| **Datenanalyse**          | `extract<T>()`                         | Einheitliche Datenextraktion                  |
|                           | `parse_json<T>()/parse_form<T>()`      | JSON/Formular parsen                          |
|                           | `parse_body<T>()`                      | Intelligentes Parsen des Anfragekörpers       |
|                           | `parse_params<T>()/parse_queries<T>()` | Parameter/Abfragen parsen                     |
| **Spezielle Funktionen**  | `cookies()/cookie()`                   | Cookie-Operationen (erfordert cookie-Feature) |
|                           | `extensions()/extensions_mut()`        | Erweiterte Datenspeicherung                   |
|                           | `set_secure_max_size()`                | Sicherheitsgrößenbeschränkung festlegen       |
