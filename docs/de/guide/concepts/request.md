# Anfrage

In Salvo können Benutzeranfragedaten über [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) abgerufen werden:

### Schnellübersicht
Request ist eine Struktur, die eine HTTP-Anfrage repräsentiert und umfassende Anfrageverarbeitungsfähigkeiten bietet:

* Operationen auf grundlegenden Attributen (URI, Methode, Version)
* Verarbeitung von Anfrage-Headern und Cookies
* Parsen verschiedener Parameter (Pfad, Query, Formular)
* Unterstützung der Anfragekörperverarbeitung und Datei-Uploads
* Bietet mehrere Datenparsermethoden (JSON, Formular usw.)
* Implementiert einheitliche typsichere Datenextraktion über die extract-Methode

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Abrufen von Query-Parametern

Query-Parameter können über `get_query` abgerufen werden:

```rust
req.query::<String>("id");
```

## Abrufen von Formulardaten

Formulardaten können über `get_form` abgerufen werden. Diese Funktion ist asynchron:

```rust
req.form::<String>("id").await;
```

## Abrufen von JSON-deserialisierten Daten

```rust
req.parse_json::<User>().await;
```

## Extrahieren von Anfragedaten

`Request` bietet mehrere Methoden, um diese Daten in stark typisierte Strukturen zu parsen.

* `parse_params`: Parst die Router-Parameter der Anfrage in einen bestimmten Datentyp.
* `parse_queries`: Parst die URL-Queries der Anfrage in einen bestimmten Datentyp.
* `parse_headers`: Parst die HTTP-Header der Anfrage in einen bestimmten Datentyp.
* `parse_json`: Parst die Daten im HTTP-Körperteil der Anfrage als JSON-Format in einen bestimmten Typ.
* `parse_form`: Parst die Daten im HTTP-Körperteil der Anfrage als Formular in einen bestimmten Typ.
* `parse_body`: Parst die Daten im HTTP-Körperteil basierend auf dem `content-type` der Anfrage in einen bestimmten Typ.
* `extract`: Kann verschiedene Datenquellen zusammenführen, um einen bestimmten Typ zu parsen.

## Parsing-Prinzip

Hier wird ein benutzerdefinierter `serde::Deserializer` verwendet, um Daten aus Strukturen wie `HashMap<String, String>` und `HashMap<String, Vec<String>>` in bestimmte Datentypen zu extrahieren.

Beispiel: `URL-Queries` werden tatsächlich als [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html)-Typ extrahiert. `MultiMap` kann als eine Datenstruktur ähnlich `HashMap<String, Vec<String>>` betrachtet werden. Wenn die angeforderte URL `http://localhost/users?id=123&id=234` ist und unser Zieltyp:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Dann wird das erste `id=123` geparst und `id=234` verworfen:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Wenn unser bereitgestellter Typ:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Dann werden beide `id=123&id=234` geparst:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Integrierte Extractor
Das Framework enthält integrierte Anfrageparameter-Extractor. Diese Extractor können den Code für die Behandlung von HTTP-Anfragen erheblich vereinfachen.

:::tip
Um sie zu verwenden, müssen Sie das `"oapi"-Feature` in Ihrer `Cargo.toml` hinzufügen
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Dann können Sie die Extractor importieren:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Wird verwendet, um JSON-Daten aus dem Anfragekörper zu extrahieren und in einen angegebenen Typ zu deserialisieren.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Erstellter Benutzer mit ID {}", user.id)
}
```

#### FormBody
Extrahiert Formulardaten aus dem Anfragekörper und deserialisiert sie in einen angegebenen Typ.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Aktualisierter Benutzer mit ID {}", user.id)
}
```

#### CookieParam
Extrahiert einen bestimmten Wert aus den Cookies der Anfrage.

```rust
// Der zweite Parameter: wenn true, wird into_inner() panikieren, wenn der Wert nicht existiert.
// Wenn false, gibt into_inner() Option<T> zurück.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("Benutzer-ID aus Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrahiert einen bestimmten Wert aus den Anfrage-Headern.

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
Extrahiert Parameter aus der URL-Query-Zeichenkette.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Suche nach Benutzer mit ID: {}", id.into_inner())
}
```

### Erweiterte Verwendung
Sie können mehrere Datenquellen zusammenführen, um einen bestimmten Typ zu parsen. Definieren Sie zunächst einen benutzerdefinierten Typ, zum Beispiel:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Standardmäßig werden Feldwerte aus dem Körper abgerufen.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Die id wird aus den Anfragepfadparametern abgerufen und automatisch als i64 geparst.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Referenztypen können verwendet werden, um Speicherkopien zu vermeiden.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Dann können Sie in einem `Handler` die Daten wie folgt abrufen:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Sie können den Typ sogar direkt als Funktionsparameter übergeben, wie hier:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Datentypdefinitionen bieten beträchtliche Flexibilität und erlauben sogar das Parsen in verschachtelte Strukturen nach Bedarf:

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
    /// Dieses verschachtelte Feld wird vollständig neu aus der Request geparst.
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

Ein konkretes Beispiel finden Sie unter: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Wenn im obigen Beispiel Nested<'a> keine Felder mit denselben Namen wie das Elternobjekt hat, können Sie `#[serde(flatten)]` verwenden. Andernfalls müssen Sie `#[salvo(extract(flatten))]` verwenden.

### `#[salvo(extract(source(parse)))]`

Sie können auch einen `parse`-Parameter zu `source` hinzufügen, um eine bestimmte Parsing-Methode anzugeben. Wenn dieser Parameter nicht angegeben ist, wird das Parsing basierend auf den `Request`-Informationen bestimmt. Für einen `Form`-Körper wird es als `MultiMap` geparst; für eine JSON-Nutzlast wird es als JSON geparst. Im Allgemeinen müssen Sie diesen Parameter nicht angeben. In seltenen Fällen kann die Angabe spezielle Funktionen ermöglichen.

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

Beispielsweise sendet hier die tatsächliche Anfrage ein Formular, aber der Wert eines bestimmten Feldes ist ein JSON-Textstück. Durch Angabe von `parse` kann diese Zeichenkette im JSON-Format geparst werden.

## Teilweise API-Übersicht. Für die neuesten und detailliertesten Informationen konsultieren Sie bitte die crates API-Dokumentation.
# Request-Struktur Methodenübersicht

| Kategorie | Methode | Beschreibung |
|----------|--------|-------------|
| **Anfrageinformationen** | `uri()/uri_mut()/set_uri()` | URI-Operationen |
| | `method()/method_mut()` | HTTP-Methoden-Operationen |
| | `version()/version_mut()` | HTTP-Versions-Operationen |
| | `scheme()/scheme_mut()` | Protokoll-Schema-Operationen |
| | `remote_addr()/local_addr()` | Adressinformationen |
| **Anfrage-Header** | `headers()/headers_mut()` | Alle Anfrage-Header abrufen |
| | `header<T>()/try_header<T>()` | Bestimmten Header abrufen und parsen |
| | `add_header()` | Anfrage-Header hinzufügen |
| | `content_type()/accept()` | Content-Type/Accept-Type abrufen |
| **Parameterbehandlung** | `params()/param<T>()` | Pfadparameter-Operationen |
| | `queries()/query<T>()` | Query-Parameter-Operationen |
| | `form<T>()/form_or_query<T>()` | Formulardaten-Operationen |
| **Anfragekörper** | `body()/body_mut()` | Anfragekörper abrufen |
| | `replace_body()/take_body()` | Anfragekörper ändern/extrahieren |
| | `payload()/payload_with_max_size()` | Rohdaten abrufen |
| **Dateibehandlung** | `file()/files()/all_files()` | Hochgeladene Dateien abrufen |
| | `first_file()` | Erste Datei abrufen |
| **Datenparsing** | `extract<T>()` | Einheitliche Datenextraktion |
| | `parse_json<T>()/parse_form<T>()` | JSON/Formular parsen |
| | `parse_body<T>()` | Anfragekörper intelligent parsen |
| | `parse_params<T>()/parse_queries<T>()` | Parameter/Queries parsen |
| **Spezielle Funktionen** | `cookies()/cookie()` | Cookie-Operationen (erfordert cookie-Feature) |
| | `extensions()/extensions_mut()` | Erweiterungsdatenspeicherung |
| | `set_secure_max_size()` | Sichere Größenbeschränkung setzen |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}