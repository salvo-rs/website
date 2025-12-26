# Requête

Dans Salvo, les données de requête utilisateur peuvent être obtenues via [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) :

### Compréhension rapide
Request est une structure représentant une requête HTTP, offrant des fonctionnalités complètes de traitement des requêtes :

* Manipulation des attributs de base (URI, méthode, version)
* Gestion des en-têtes et des cookies
* Analyse de divers paramètres (chemin, requête, formulaire)
* Prise en charge du traitement du corps de la requête et du téléchargement de fichiers
* Fourniture de multiples méthodes d'analyse de données (JSON, formulaire, etc.)
* Extraction de données avec sécurité de type unifiée via la méthode extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obtenir les paramètres de requête

Les paramètres de requête peuvent être obtenus via `get_query` :

```rust
req.query::<String>("id");
```

## Obtenir les données de formulaire

Les données de formulaire peuvent être obtenues via `get_form`, cette fonction étant asynchrone :

```rust
req.form::<String>("id").await;
```

## Obtenir les données désérialisées JSON

```rust
req.parse_json::<User>().await;
```

## Extraire les données de la requête

`Request` fournit plusieurs méthodes pour analyser ces données en structures fortement typées.

* `parse_params` : analyse les paramètres de route de la requête en un type de données spécifique ;
* `parse_queries` : analyse les requêtes d'URL de la requête en un type de données spécifique ;
* `parse_headers` : analyse les en-têtes HTTP de la requête en un type de données spécifique ;
* `parse_json` : analyse les données de la partie corps HTTP de la requête au format JSON vers un type spécifique ;
* `parse_form` : analyse les données de la partie corps HTTP de la requête comme un formulaire vers un type spécifique ;
* `parse_body` : selon le type `content-type` de la requête, analyse les données de la partie corps HTTP en un type spécifique.
* `extract` : peut combiner différentes sources de données pour analyser un type spécifique.

## Principe d'analyse

Ici, un `serde::Deserializer` personnalisé est utilisé pour extraire des données de type `HashMap<String, String>` et `HashMap<String, Vec<String>>` vers des types de données spécifiques.

Par exemple : `URL queries` est en réalité extrait en un type [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` peut être considéré comme une structure de données similaire à `HashMap<String, Vec<String>>`. Si l'URL de la requête est `http://localhost/users?id=123&id=234`, et que le type cible fourni est :

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Alors le premier `id=123` sera analysé, et `id=234` sera ignoré :

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Si le type fourni est :

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Alors `id=123&id=234` seront tous deux analysés :

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extracteurs intégrés
Le framework intègre des extracteurs de paramètres de requête. Ces extracteurs peuvent grandement simplifier le code de traitement des requêtes HTTP.

:::tip
Pour les utiliser, vous devez ajouter la fonctionnalité `"oapi"` dans votre `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Ensuite, vous pouvez importer les extracteurs :
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Utilisé pour extraire les données JSON du corps de la requête et les désérialiser en un type spécifié.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Utilisateur avec ID {} créé", user.id)
}
```

#### FormBody
Extrait les données de formulaire du corps de la requête et les désérialise en un type spécifié.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Utilisateur avec ID {} mis à jour", user.id)
}
```

#### CookieParam
Extrait une valeur spécifique des cookies de la requête.

```rust
//Le deuxième paramètre, s'il est true, fera panic into_inner() si la valeur n'existe pas ; s'il est false,
//la méthode into_inner() retournera Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID utilisateur obtenu depuis le cookie : {}", user_id.into_inner())
}
```

#### HeaderParam

Extrait une valeur spécifique des en-têtes de la requête.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID utilisateur obtenu depuis l'en-tête : {}", user_id.into_inner())
}
```

#### PathParam
Extrait un paramètre du chemin de l'URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID utilisateur obtenu depuis le chemin : {}", id.into_inner())
}
```

#### QueryParam
Extrait un paramètre de la chaîne de requête de l'URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Recherche de l'utilisateur avec ID {}", id.into_inner())
}
```

### Utilisation avancée
Il est possible de combiner plusieurs sources de données pour analyser un type spécifique. Vous pouvez d'abord définir un type personnalisé, par exemple :

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Par défaut, obtient les valeurs des champs de données depuis le corps
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Ici, l'ID est obtenu depuis les paramètres du chemin de la requête et automatiquement analysé en i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Les types référence peuvent être utilisés pour éviter la copie mémoire.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Ensuite, dans le `Handler`, les données peuvent être obtenues ainsi :

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Il est même possible de passer directement le type en paramètre de la fonction, comme ceci :

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

La définition des types de données offre une flexibilité considérable, permettant même une analyse en structures imbriquées selon les besoins :

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
    /// Ce champ nested est entièrement réanalysé depuis la Request.
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

Voir l'exemple concret : [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Si dans l'exemple ci-dessus Nested<'a> n'a pas les mêmes champs que le parent, vous pouvez utiliser `#[serde(flatten)]`, sinon vous devez utiliser `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Il est également possible d'ajouter un paramètre `parse` à `source` pour spécifier un mode d'analyse particulier. Si ce paramètre n'est pas spécifié, l'analyse sera déterminée par les informations de la `Request`. Si le corps est un formulaire, il sera analysé comme `MultiMap` ; si c'est une charge utile JSON, il sera analysé au format JSON. En général, ce paramètre n'a pas besoin d'être spécifié. Dans de rares cas, le spécifier peut permettre des fonctionnalités spéciales.

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

Par exemple, ici la requête réelle envoie un formulaire, mais la valeur d'un certain champ est un texte JSON. Dans ce cas, en spécifiant `parse`, cette chaîne peut être analysée au format JSON.

## Aperçu partiel des API, pour les informations les plus récentes et détaillées, veuillez consulter la documentation de l'API crates
# Aperçu des méthodes de la structure Request

| Catégorie | Méthode | Description |
|------|------|------|
| **Informations de requête** | `uri()/uri_mut()/set_uri()` | Opérations sur l'URI |
| | `method()/method_mut()` | Opérations sur la méthode HTTP |
| | `version()/version_mut()` | Opérations sur la version HTTP |
| | `scheme()/scheme_mut()` | Opérations sur le schéma de protocole |
| | `remote_addr()/local_addr()` | Informations d'adresse |
| **En-têtes de requête** | `headers()/headers_mut()` | Obtient tous les en-têtes de requête |
| | `header<T>()/try_header<T>()` | Obtient et analyse un en-tête spécifique |
| | `add_header()` | Ajoute un en-tête de requête |
| | `content_type()/accept()` | Obtient le type de contenu/type accepté |
| **Traitement des paramètres** | `params()/param<T>()` | Opérations sur les paramètres de chemin |
| | `queries()/query<T>()` | Opérations sur les paramètres de requête |
| | `form<T>()/form_or_query<T>()` | Opérations sur les données de formulaire |
| **Corps de la requête** | `body()/body_mut()` | Obtient le corps de la requête |
| | `replace_body()/take_body()` | Modifie/Extrait le corps de la requête |
| | `payload()/payload_with_max_size()` | Obtient les données brutes |
| **Traitement des fichiers** | `file()/files()/all_files()` | Obtient les fichiers téléchargés |
| | `first_file()` | Obtient le premier fichier |
| **Analyse des données** | `extract<T>()` | Extraction unifiée des données |
| | `parse_json<T>()/parse_form<T>()` | Analyse JSON/Formulaire |
| | `parse_body<T>()` | Analyse intelligente du corps de la requête |
| | `parse_params<T>()/parse_queries<T>()` | Analyse des paramètres/requêtes |
| **Fonctionnalités spéciales** | `cookies()/cookie()` | Opérations sur les cookies (nécessite la fonctionnalité cookie) |
| | `extensions()/extensions_mut()` | Stockage de données d'extension |
| | `set_secure_max_size()` | Définit la limite de taille de sécurité |
{/* Auto generated, origin file hash:6b654f79df08ba1dc5cc1c070780def0 */}