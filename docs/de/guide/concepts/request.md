# Anfrage

In Salvo können Benutzeranfragedaten über [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) abgerufen werden:

### Schnellverständnis
Request ist eine Struktur, die eine HTTP-Anfrage repräsentiert und umfassende Anfrageverarbeitungsfunktionen bietet:

* Manipulation grundlegender Attribute (URI, Methode, Version)
* Verarbeitung von Anfrageheadern und Cookies
* Parsen verschiedener Parameter (Pfad, Abfrage, Formular)
* Unterstützung für Anfragekörperverarbeitung und Dateiupload
* Bereitstellung mehrerer Datenparsermethoden (JSON, Formular usw.)
* Einheitliche typsichere Datenextraktion über die extract-Methode

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Abfrageparameter abrufen

Abfrageparameter können über `get_query` abgerufen werden:

```rust
req.query::<String>("id");
```

## Formulardaten abrufen

Formulardaten können über `get_form` abgerufen werden, diese Funktion ist asynchron:

```rust
req.form::<String>("id").await;
```

## JSON-deserialisierte Daten abrufen

```rust
req.parse_json::<User>().await;
```

## Request-Daten extrahieren

`Request` bietet mehrere Methoden, um diese Daten in stark typisierte Strukturen zu parsen.

* `parse_params`: Parst die Router-Parameter der Anfrage in einen bestimmten Datentyp;
* `parse_queries`: Parst die URL-Abfragen der Anfrage in einen bestimmten Datentyp;
* `parse_headers`: Parst die HTTP-Header der Anfrage in einen bestimmten Datentyp;
* `parse_json`: Parst die Daten des HTTP-Body-Teils der Anfrage als JSON-Format in einen bestimmten Typ;
* `parse_form`: Parst die Daten des HTTP-Body-Teils der Anfrage als Formular in einen bestimmten Typ;
* `parse_body`: Parst die Daten des HTTP-Body-Teils der Anfrage basierend auf dem `content-type` in einen bestimmten Typ.
* `extract`: Kann verschiedene Datenquellen kombinieren, um einen bestimmten Typ zu extrahieren.

## Parsing-Prinzip

Hier werden Daten ähnlich wie `HashMap<String, String>` und `HashMap<String, Vec<String>>` über einen benutzerdefinierten `serde::Deserializer` in bestimmte Datentypen extrahiert.

Zum Beispiel: `URL queries` werden tatsächlich als [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html)-Typ extrahiert. `MultiMap` kann als eine Datenstruktur ähnlich `HashMap<String, Vec<String>>` betrachtet werden. Wenn die angeforderte URL `http://localhost/users?id=123&id=234` ist und der bereitgestellte Zieltyp:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Dann wird das erste `id=123` geparst, `id=234` wird verworfen:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Wenn der bereitgestellte Typ:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Dann werden sowohl `id=123` als auch `id=234` geparst:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Integrierte Extractor
Das Framework bietet integrierte Anfrageparameterextraktoren. Diese Extractor können den Code zur Verarbeitung von HTTP-Anfragen erheblich vereinfachen.

:::tip
Um die Extractor zu verwenden, müssen Sie das `"oapi"`-Feature in Ihrer `Cargo.toml` hinzufügen:
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
    format!("Benutzer mit ID {} erstellt", user.id)
}
```

#### FormBody
Extrahiert Formulardaten aus dem Anfragekörper und deserialisiert sie in einen angegebenen Typ.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Benutzer mit ID {} aktualisiert", user.id)
}
```

#### CookieParam
Extrahiert einen bestimmten Wert aus den Cookies der Anfrage.

```rust
// Zweiter Parameter: Wenn true, panic bei fehlendem Wert in into_inner(); wenn false,
// gibt into_inner() Option<T> zurück.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("Benutzer-ID aus Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrahiert einen bestimmten Wert aus den Anfrageheadern.

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
Mehrere Datenquellen können kombiniert werden, um einen bestimmten Typ zu extrahieren. Zuerst kann ein benutzerdefinierter Typ definiert werden, z.B.:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Standardmäßig werden Datenfeldwerte aus dem Body abgerufen
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

Dann können Daten im `Handler` wie folgt abgerufen werden:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Oder der Typ kann sogar direkt als Parameter an die Funktion übergeben werden, wie hier:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Die Definition von Datentypen ist sehr flexibel und kann sogar nach Bedarf in verschachtelte Strukturen geparst werden:

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
    /// Dieses nested-Feld wird vollständig neu aus der Request geparst.
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

Wenn im obigen Beispiel Nested<'a> keine Felder hat, die mit den übergeordneten Feldern übereinstimmen, kann `#[serde(flatten)]` verwendet werden, andernfalls muss `#[salvo(extract(flatten))]` verwendet werden.

### `#[salvo(extract(source(parse)))]`

Tatsächlich kann der `source` auch ein `parse`-Parameter hinzugefügt werden, um eine bestimmte Parsing-Methode anzugeben. Wenn dieser Parameter nicht angegeben wird, entscheidet das Parsing basierend auf den Informationen der `Request` über die Parsing-Methode des Body-Teils. Bei Formularen wird es als `MultiMap` geparst, bei JSON-Payloads im JSON-Format. In den meisten Fällen muss dieser Parameter nicht angegeben werden. In Einzelfällen kann durch die Angabe dieses Parameters eine spezielle Funktion implementiert werden.

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

Hier kommt beispielsweise tatsächlich ein Formular als Anfrage, aber der Wert eines bestimmten Feldes ist ein JSON-Text. In diesem Fall kann durch Angabe von `parse` dieser String im JSON-Format geparst werden.

## Teilweise API-Übersicht, für die neuesten und detailliertesten Informationen siehe die Crate-API-Dokumentation
# Überblick über die Methoden der Request-Struktur

| Kategorie | Methode | Beschreibung |
|------|------|------|
| **Anfrageinformationen** | `uri()/uri_mut()/set_uri()` | URI-Operationen |
| | `method()/method_mut()` | HTTP-Methodenoperationen |
| | `version()/version_mut()` | HTTP-Versionsoperationen |
| | `scheme()/scheme_mut()` | Protokollschemata-Operationen |
| | `remote_addr()/local_addr()` | Adressinformationen |
| **Anfrageheader** | `headers()/headers_mut()` | Alle Anfrageheader abrufen |
| | `header<T>()/try_header<T>()` | Bestimmten Header abrufen und parsen |
| | `add_header()` | Anfrageheader hinzufügen |
| | `content_type()/accept()` | Inhaltstyp/Akzeptanztyp abrufen |
| **Parameterverarbeitung** | `params()/param<T>()` | Pfadparameteroperationen |
| | `queries()/query<T>()` | Abfrageparameteroperationen |
| | `form<T>()/form_or_query<T>()` | Formulardatenoperationen |
| **Anfragekörper** | `body()/body_mut()` | Anfragekörper abrufen |
| | `replace_body()/take_body()` | Anfragekörper ändern/extrahieren |
| | `payload()/payload_with_max_size()` | Rohdaten abrufen |
| **Dateiverarbeitung** | `file()/files()/all_files()` | Hochgeladene Dateien abrufen |
| | `first_file()` | Erste Datei abrufen |
| **Datenparsing** | `extract<T>()` | Einheitliche Datenextraktion |
| | `parse_json<T>()/parse_form<T>()` | JSON/Formular parsen |
| | `parse_body<T>()` | Intelligentes Parsing des Anfragekörpers |
| | `parse_params<T>()/parse_queries<T>()` | Parameter/Abfragen parsen |
| **Spezielle Funktionen** | `cookies()/cookie()` | Cookie-Operationen (erfordert cookie-Feature) |
| | `extensions()/extensions_mut()` | Erweiterungsdatenspeicherung |
| | `set_secure_max_size()` | Sicherheitsgrößenbeschränkung setzen |
{/* Auto generated, origin file hash:6b654f79df08ba1dc5cc1c070780def0 */}