# Request

In Salvo, i dati della richiesta dell'utente possono essere ottenuti tramite [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Comprensione Rapida
Request è una struttura che rappresenta una richiesta HTTP, fornendo funzionalità complete per la gestione delle richieste:

* Gestione degli attributi di base (URI, metodo, versione)
* Gestione di intestazioni e Cookie
* Parsing di vari tipi di parametri (percorso, query, form)
* Supporto per l'elaborazione del corpo della richiesta e il caricamento di file
* Metodi multipli per il parsing dei dati (JSON, form, ecc.)
* Estrazione unificata e type-safe dei dati tramite il metodo extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Ottenere Parametri di Query

I parametri di query possono essere ottenuti tramite `query`:

```rust
req.query::<String>("id");
```

## Ottenere Dati dal Form

I dati del form possono essere ottenuti tramite `form`, questa funzione è asincrona:

```rust
req.form::<String>("id").await;
```

## Ottenere Dati Deserializzati JSON

```rust
req.parse_json::<User>().await;
```

## Estrazione dei Dati dalla Request

`Request` fornisce diversi metodi per analizzare questi dati in strutture fortemente tipizzate.

* `parse_params`: Analizza i parametri del router della richiesta in un tipo di dati specifico;
* `parse_queries`: Analizza le query URL della richiesta in un tipo di dati specifico;
* `parse_headers`: Analizza le intestazioni HTTP della richiesta in un tipo di dati specifico;
* `parse_json`: Analizza la parte del corpo HTTP della richiesta come formato JSON in un tipo specifico;
* `parse_form`: Analizza la parte del corpo HTTP della richiesta come form in un tipo specifico;
* `parse_body`: In base al tipo `content-type` della richiesta, analizza la parte del corpo HTTP in un tipo specifico.
* `extract`: Può combinare diverse fonti di dati per analizzarle in un tipo specifico.

## Principio di Parsing

Qui, utilizzando un `serde::Deserializer` personalizzato, i dati simili a `HashMap<String, String>` e `HashMap<String, Vec<String>>` vengono estratti in tipi di dati specifici.

Ad esempio: le `URL queries` vengono effettivamente estratte come un tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` può essere considerato una struttura dati simile a `HashMap<String, Vec<String>>`. Se l'URL della richiesta è `http://localhost/users?id=123&id=234` e il tipo di destinazione fornito è:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Allora il primo `id=123` verrà analizzato, mentre `id=234` verrà scartato:

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

Allora sia `id=123` che `id=234` verranno analizzati:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Estrattori Integrati
Il framework include estrattori di parametri di richiesta. Questi estrattori possono semplificare notevolmente il codice per la gestione delle richieste HTTP.

:::tip
Per utilizzarli è necessario aggiungere la feature `"oapi"` nel tuo `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Quindi puoi importare gli estrattori:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Utilizzato per estrarre dati JSON dal corpo della richiesta e deserializzarli in un tipo specificato.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Utente con ID {} creato", user.id)
}
```
#### FormBody
Estrae i dati del form dal corpo della richiesta e li deserializza in un tipo specificato.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Utente con ID {} aggiornato", user.id)
}
```
#### CookieParam
Estrae un valore specifico dai Cookie della richiesta.

```rust
//Il secondo parametro, se true, fa sì che into_inner() generi un panic se il valore non esiste; se false,
//il metodo into_inner() restituisce Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID utente ottenuto dal Cookie: {}", user_id.into_inner())
}
```
#### HeaderParam

Estrae un valore specifico dalle intestazioni della richiesta.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID utente ottenuto dall'intestazione: {}", user_id.into_inner())
}
```
#### PathParam
Estrae un parametro dal percorso URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID utente ottenuto dal percorso: {}", id.into_inner())
}
```
#### QueryParam
Estrae un parametro dalla stringa di query URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Ricerca utente con ID: {}", id.into_inner())
}
```
### Utilizzo Avanzato
È possibile combinare più fonti di dati per analizzarle in un tipo specifico. Prima si definisce un tipo personalizzato, ad esempio:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Per impostazione predefinita, ottiene i valori dei campi dati dal body
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Qui, l'ID viene ottenuto dai parametri del percorso della richiesta e analizzato automaticamente come tipo i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// È possibile utilizzare tipi di riferimento per evitare la copia in memoria.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Quindi, nell'`Handler`, i dati possono essere ottenuti così:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Si può persino passare direttamente il tipo come parametro alla funzione, in questo modo:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

La definizione del tipo di dati è abbastanza flessibile e può essere analizzata anche in strutture annidate secondo necessità:

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
    /// Questo campo nested viene completamente ri-analizzato dalla Request.
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

Per un esempio concreto, vedere: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se nell'esempio sopra Nested<'a> non ha campi in comune con il genitore, si può usare `#[serde(flatten)]`, altrimenti è necessario usare `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

In realtà, si può anche aggiungere un parametro `parse` a `source` per specificare un metodo di analisi particolare. Se questo parametro non viene specificato, l'analisi della parte `Body` sarà decisa in base alle informazioni della `Request`: se è un form, verrà analizzato come `MultiMap`; se è un payload JSON, verrà analizzato in formato JSON. In genere, non è necessario specificare questo parametro, ma in casi particolari, specificarlo può abilitare alcune funzionalità speciali.

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

Ad esempio, qui la richiesta effettiva inviata è un Form, ma il valore di un certo campo è un testo JSON. In questo caso, specificando `parse`, questa stringa può essere analizzata in formato JSON.

## Panoramica di alcune API, per le informazioni più recenti e dettagliate fare riferimento alla documentazione API di crates
# Panoramica dei Metodi della Struttura Request

| Categoria | Metodo | Descrizione |
|------|------|------|
| **Informazioni Richiesta** | `uri()/uri_mut()/set_uri()` | Operazioni URI |
| | `method()/method_mut()` | Operazioni metodo HTTP |
| | `version()/version_mut()` | Operazioni versione HTTP |
| | `scheme()/scheme_mut()` | Operazioni schema protocollo |
| | `remote_addr()/local_addr()` | Informazioni indirizzo |
| **Intestazioni Richiesta** | `headers()/headers_mut()` | Ottieni tutte le intestazioni |
| | `header<T>()/try_header<T>()` | Ottieni e analizza intestazione specifica |
| | `add_header()` | Aggiungi intestazione richiesta |
| | `content_type()/accept()` | Ottieni tipo contenuto/tipo accettato |
| **Gestione Parametri** | `params()/param<T>()` | Operazioni parametri percorso |
| | `queries()/query<T>()` | Operazioni parametri query |
| | `form<T>()/form_or_query<T>()` | Operazioni dati form |
| **Corpo Richiesta** | `body()/body_mut()` | Ottieni corpo richiesta |
| | `replace_body()/take_body()` | Modifica/estrai corpo richiesta |
| | `payload()/payload_with_max_size()` | Ottieni dati grezzi |
| **Gestione File** | `file()/files()/all_files()` | Ottieni file caricati |
| | `first_file()` | Ottieni primo file |
| **Analisi Dati** | `extract<T>()` | Estrazione unificata dati |
| | `parse_json<T>()/parse_form<T>()` | Analizza JSON/form |
| | `parse_body<T>()` | Analisi intelligente corpo richiesta |
| | `parse_params<T>()/parse_queries<T>()` | Analizza parametri/query |
| **Funzionalità Speciali** | `cookies()/cookie()` | Operazioni Cookie (richiede feature cookie) |
| | `extensions()/extensions_mut()` | Archiviazione dati estensioni |
| | `set_secure_max_size()` | Imposta limite dimensione sicura |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}