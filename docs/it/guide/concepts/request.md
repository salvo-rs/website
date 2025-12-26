# Request

In Salvo, i dati della richiesta dell'utente possono essere ottenuti tramite [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Panoramica Rapida
Request è una struttura che rappresenta una richiesta HTTP, fornendo capacità complete di gestione delle richieste:

* Opera sugli attributi di base (URI, metodo, versione)
* Gestisce gli header della richiesta e i Cookie
* Analizza vari parametri (percorso, query, form)
* Supporta l'elaborazione del corpo della richiesta e il caricamento di file
* Offre molteplici metodi di analisi dei dati (JSON, form, ecc.)
* Implementa l'estrazione di dati unificata e type-safe tramite il metodo extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Ottenere i Parametri della Query

I parametri della query possono essere ottenuti tramite `get_query`:

```rust
req.query::<String>("id");
```

## Ottenere i Dati del Form

I dati del form possono essere ottenuti tramite `get_form`. Questa funzione è asincrona:

```rust
req.form::<String>("id").await;
```

## Ottenere Dati Deserializzati JSON

```rust
req.parse_json::<User>().await;
```

## Estrazione dei Dati della Richiesta

`Request` fornisce molteplici metodi per analizzare questi dati in strutture fortemente tipizzate.

* `parse_params`: Analizza i parametri del router della richiesta in un tipo di dato specifico.
* `parse_queries`: Analizza le query dell'URL della richiesta in un tipo di dato specifico.
* `parse_headers`: Analizza gli header HTTP della richiesta in un tipo di dato specifico.
* `parse_json`: Analizza i dati nella parte del corpo HTTP della richiesta in formato JSON in un tipo specifico.
* `parse_form`: Analizza i dati nella parte del corpo HTTP della richiesta come Form in un tipo specifico.
* `parse_body`: Analizza i dati nella parte del corpo HTTP in un tipo specifico basandosi sul `content-type` della richiesta.
* `extract`: Può unire diverse fonti di dati per analizzare un tipo specifico.

## Principio di Analisi

Qui viene utilizzato un `serde::Deserializer` personalizzato per estrarre dati da strutture come `HashMap<String, String>` e `HashMap<String, Vec<String>>` in tipi di dati specifici.

Ad esempio: le `query URL` sono effettivamente estratte come un tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` può essere pensata come una struttura dati simile a `HashMap<String, Vec<String>>`. Se l'URL richiesto è `http://localhost/users?id=123&id=234`, e il nostro tipo target è:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Allora il primo `id=123` verrà analizzato, e `id=234` verrà scartato:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Se il tipo che forniamo è:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Allora entrambi `id=123&id=234` verranno analizzati:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Estrattori Integrati
Il framework include estrattori integrati per i parametri della richiesta. Questi estrattori possono semplificare notevolmente il codice per gestire le richieste HTTP.

:::tip
Per utilizzarli, è necessario aggiungere la feature `"oapi"` nel tuo `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Poi puoi importare gli estrattori:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Utilizzato per estrarre dati JSON dal corpo della richiesta e deserializzarli in un tipo specificato.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Creato utente con ID {}", user.id)
}
```

#### FormBody
Estrae i dati del form dal corpo della richiesta e li deserializza in un tipo specificato.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Aggiornato utente con ID {}", user.id)
}
```

#### CookieParam
Estrae un valore specifico dai Cookie della richiesta.

```rust
// Secondo parametro: se true, into_inner() andrà in panic se il valore non esiste.
// Se false, into_inner() restituisce Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID Utente dal Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Estrae un valore specifico dagli header della richiesta.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID Utente dall'Header: {}", user_id.into_inner())
}
```

#### PathParam
Estrae i parametri dal percorso dell'URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID Utente dal Percorso: {}", id.into_inner())
}
```

#### QueryParam
Estrae i parametri dalla stringa di query dell'URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Ricerca utente con ID: {}", id.into_inner())
}
```

### Utilizzo Avanzato
Puoi unire più fonti di dati per analizzare un tipo specifico. Per prima cosa, definisci un tipo personalizzato, ad esempio:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Per impostazione predefinita, ottiene i valori dei campi dal corpo.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// L'id è ottenuto dai parametri del percorso della richiesta e analizzato automaticamente come i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// I tipi riferimento possono essere usati per evitare la copia della memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Poi in un `Handler`, puoi ottenere i dati in questo modo:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Puoi persino passare il tipo direttamente come parametro di funzione, in questo modo:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Le definizioni dei tipi di dati offrono una notevole flessibilità, permettendo persino di analizzare in strutture annidate secondo necessità:

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
    /// Questo campo annidato viene analizzato nuovamente interamente dalla Request.
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

Per un esempio concreto, vedi: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se nell'esempio sopra Nested<'a> non ha campi con gli stessi nomi del genitore, puoi usare `#[serde(flatten)]`. Altrimenti, devi usare `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Puoi anche aggiungere un parametro `parse` a `source` per specificare un particolare metodo di analisi. Se questo parametro non è specificato, l'analisi è determinata in base alle informazioni della `Request`. Per un corpo `Form`, viene analizzato come `MultiMap`; per un payload JSON, viene analizzato come JSON. Generalmente, non è necessario specificare questo parametro. In rari casi, specificarlo può abilitare funzionalità speciali.

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

Ad esempio, qui la richiesta effettiva invia un Form, ma il valore di un certo campo è un pezzo di testo JSON. Specificando `parse`, questa stringa può essere analizzata in formato JSON.

## Panoramica Parziale dell'API. Per le informazioni più recenti e dettagliate, si prega di fare riferimento alla documentazione API delle crate.
# Panoramica dei Metodi della Struttura Request

| Categoria | Metodo | Descrizione |
|----------|--------|-------------|
| **Informazioni Richiesta** | `uri()/uri_mut()/set_uri()` | Operazioni URI |
| | `method()/method_mut()` | Operazioni metodo HTTP |
| | `version()/version_mut()` | Operazioni versione HTTP |
| | `scheme()/scheme_mut()` | Operazioni schema protocollo |
| | `remote_addr()/local_addr()` | Informazioni indirizzo |
| **Header Richiesta** | `headers()/headers_mut()` | Ottieni tutti gli header della richiesta |
| | `header<T>()/try_header<T>()` | Ottieni e analizza un header specifico |
| | `add_header()` | Aggiungi un header di richiesta |
| | `content_type()/accept()` | Ottieni tipo contenuto/tipo accettato |
| **Gestione Parametri** | `params()/param<T>()` | Operazioni parametri percorso |
| | `queries()/query<T>()` | Operazioni parametri query |
| | `form<T>()/form_or_query<T>()` | Operazioni dati form |
| **Corpo Richiesta** | `body()/body_mut()` | Ottieni il corpo della richiesta |
| | `replace_body()/take_body()` | Modifica/estrai il corpo della richiesta |
| | `payload()/payload_with_max_size()` | Ottieni dati grezzi |
| **Gestione File** | `file()/files()/all_files()` | Ottieni file caricati |
| | `first_file()` | Ottieni il primo file |
| **Analisi Dati** | `extract<T>()` | Estrazione dati unificata |
| | `parse_json<T>()/parse_form<T>()` | Analizza JSON/form |
| | `parse_body<T>()` | Analizza intelligentemente il corpo della richiesta |
| | `parse_params<T>()/parse_queries<T>()` | Analizza parametri/query |
| **Funzionalità Speciali** | `cookies()/cookie()` | Operazioni Cookie (richiede feature cookie) |
| | `extensions()/extensions_mut()` | Archiviazione dati estensioni |
| | `set_secure_max_size()` | Imposta limite dimensione sicura |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}