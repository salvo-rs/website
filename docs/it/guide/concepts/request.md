# Richiesta

In Salvo, i dati della richiesta dell'utente possono essere ottenuti tramite [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Comprensione rapida
Request è una struttura che rappresenta una richiesta HTTP, fornendo funzionalità complete per la gestione delle richieste:

* Gestione degli attributi di base (URI, metodo, versione)
* Gestione degli header e dei cookie
* Analisi di vari tipi di parametri (percorso, query, form)
* Supporto per l'elaborazione del corpo della richiesta e il caricamento di file
* Metodi multipli per l'analisi dei dati (JSON, form, ecc.)
* Estrazione unificata e type-safe dei dati tramite il metodo extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Ottenere i parametri della query

È possibile ottenere i parametri della query con `get_query`:

```rust
req.query::<String>("id");
```

## Ottenere i dati del form

È possibile ottenere i dati del form con `get_form`, questa funzione è asincrona:

```rust
req.form::<String>("id").await;
```

## Ottenere i dati deserializzati JSON

```rust
req.parse_json::<User>().await;
```

## Estrazione dei dati dalla Request

`Request` fornisce diversi metodi per analizzare questi dati in strutture fortemente tipizzate.

* `parse_params`: analizza i parametri del router in un tipo di dato specifico;
* `parse_queries`: analizza le query dell'URL in un tipo di dato specifico;
* `parse_headers`: analizza gli header HTTP in un tipo di dato specifico;
* `parse_json`: analizza il corpo della richiesta HTTP come JSON in un tipo specifico;
* `parse_form`: analizza il corpo della richiesta HTTP come form in un tipo specifico;
* `parse_body`: analizza il corpo della richiesta HTTP in base al `content-type` in un tipo specifico;
* `extract`: può combinare diverse fonti di dati per analizzarle in un tipo specifico.

## Principio di analisi

Qui, utilizzando un `serde::Deserializer` personalizzato, i dati simili a `HashMap<String, String>` e `HashMap<String, Vec<String>>` vengono estratti in tipi di dati specifici.

Ad esempio: le `URL queries` vengono effettivamente estratte come tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), che può essere considerato simile a una struttura dati `HashMap<String, Vec<String>>`. Se l'URL della richiesta è `http://localhost/users?id=123&id=234`, il tipo di destinazione fornito è:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Il primo `id=123` verrà analizzato, mentre `id=234` verrà scartato:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Se il tipo fornito è:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Allora `id=123&id=234` verranno entrambi analizzati:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Estrattori integrati
Il framework include estrattori di parametri integrati. Questi estrattori possono semplificare notevolmente il codice per la gestione delle richieste HTTP.

:::tip
Per utilizzarli, è necessario aggiungere la feature `"oapi"` nel tuo `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Quindi puoi importare gli estrattori:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Utilizzato per estrarre dati JSON dal corpo della richiesta e deserializzarli in un tipo specifico.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Utente creato con ID {}", user.id)
}
```

#### FormBody
Estrae dati dal form nel corpo della richiesta e li deserializza in un tipo specifico.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Utente aggiornato con ID {}", user.id)
}
```

#### CookieParam
Estrae un valore specifico dai cookie della richiesta.

```rust
//Il secondo parametro, se true, farà panic in into_inner() se il valore non esiste, se false,
//into_inner() restituirà Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID utente ottenuto dai cookie: {}", user_id.into_inner())
}
```

#### HeaderParam

Estrae un valore specifico dagli header della richiesta.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID utente ottenuto dagli header: {}", user_id.into_inner())
}
```

#### PathParam
Estrae parametri dal percorso dell'URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID utente ottenuto dal percorso: {}", id.into_inner())
}
```

#### QueryParam
Estrae parametri dalla stringa di query dell'URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Ricerca utente con ID {}", id.into_inner())
}
```

### Utilizzo avanzato
È possibile combinare più fonti di dati per analizzarle in un tipo specifico. Prima definisci un tipo personalizzato, ad esempio:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Per impostazione predefinita, ottiene i valori dei campi dal body
#[salvo(extract(default_source(from = "body"))]
struct GoodMan<'a> {
    /// L'id viene ottenuto dai parametri del percorso e automaticamente analizzato come i64.
    #[salvo(extract(source(from = "param"))]
    id: i64,
    /// È possibile utilizzare tipi di riferimento per evitare copie di memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Quindi, nell'`Handler`, puoi ottenere i dati così:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

O addirittura puoi passare direttamente il tipo come parametro alla funzione, così:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

La definizione del tipo di dati è molto flessibile, permettendo anche strutture nidificate:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    #[salvo(extract(source(from = "param"))]
    id: i64,
    #[salvo(extract(source(from = "query"))]
    username: &'a str,
    first_name: String,
    last_name: String,
    lovers: Vec<String>,
    /// Questo campo nested viene completamente ri-analizzato dalla Request.
    #[salvo(extract(flatten))]
    nested: Nested<'a>,
}

#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct Nested<'a> {
    #[salvo(extract(source(from = "param"))]
    id: i64,
    #[salvo(extract(source(from = "query"))]
    username: &'a str,
    first_name: String,
    last_name: String,
    #[salvo(extract(rename = "lovers"))]
    #[serde(default)]
    pets: Vec<String>,
}
```

Per un esempio concreto, vedi: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se nel precedente esempio Nested<'a> non ha campi in comune con il genitore, puoi usare `#[serde(flatten)]`, altrimenti devi usare `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

In realtà, puoi anche aggiungere un parametro `parse` a `source` per specificare un metodo di analisi particolare. Se questo parametro non è specificato, l'analisi sarà determinata dalle informazioni della `Request`: se il `Body` è un form, verrà analizzato come `MuiltMap`, se è un payload JSON, verrà analizzato come JSON. Generalmente non è necessario specificare questo parametro, ma in casi particolari può essere utile per funzionalità speciali.

```rust
#[tokio::test]
async fn test_de_request_with_form_json_str() {
    #[derive(Deserialize, Eq, PartialEq, Debug)]
    struct User<'a> {
        name: &'a str,
        age: usize,
    }
    #[derive(Deserialize, Extractible, Eq, PartialEq, Debug)]
    #[salvo(extract(default_source(from = "body", parse = "json"))]
    struct RequestData<'a> {
        #[salvo(extract(source(from = "param"))]
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

Ad esempio, qui la richiesta effettiva invia un Form, ma il valore di un campo è una stringa JSON. In questo caso, specificando `parse`, la stringa può essere analizzata come JSON.

## Panoramica di alcune API, per informazioni più recenti e dettagliate consulta la documentazione delle API
# Panoramica dei metodi della struttura Request

| Categoria | Metodo | Descrizione |
|------|------|------|
| **Informazioni sulla richiesta** | `uri()/uri_mut()/set_uri()` | Operazioni sull'URI |
| | `method()/method_mut()` | Operazioni sul metodo HTTP |
| | `version()/version_mut()` | Operazioni sulla versione HTTP |
| | `scheme()/scheme_mut()` | Operazioni sullo schema del protocollo |
| | `remote_addr()/local_addr()` | Informazioni sull'indirizzo |
| **Header della richiesta** | `headers()/headers_mut()` | Ottieni tutti gli header |
| | `header<T>()/try_header<T>()` | Ottieni e analizza un header specifico |
| | `add_header()` | Aggiungi un header |
| | `content_type()/accept()` | Ottieni il tipo di contenuto/tipo accettato |
| **Gestione dei parametri** | `params()/param<T>()` | Operazioni sui parametri del percorso |
| | `queries()/query<T>()` | Operazioni sui parametri della query |
| | `form<T>()/form_or_query<T>()` | Operazioni sui dati del form |
| **Corpo della richiesta** | `body()/body_mut()` | Ottieni il corpo della richiesta |
| | `replace_body()/take_body()` | Modifica/estrai il corpo della richiesta |
| | `payload()/payload_with_max_size()` | Ottieni i dati grezzi |
| **Gestione dei file** | `file()/files()/all_files()` | Ottieni i file caricati |
| | `first_file()` | Ottieni il primo file |
| **Analisi dei dati** | `extract<T>()` | Estrazione unificata dei dati |
| | `parse_json<T>()/parse_form<T>()` | Analizza JSON/form |
| | `parse_body<T>()` | Analisi intelligente del corpo della richiesta |
| | `parse_params<T>()/parse_queries<T>()` | Analizza parametri/query |
| **Funzionalità speciali** | `cookies()/cookie()` | Operazioni sui cookie (richiede la feature cookie) |
| | `extensions()/extensions_mut()` | Archiviazione dati estesa |
| | `set_secure_max_size()` | Imposta il limite di dimensione sicura |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}