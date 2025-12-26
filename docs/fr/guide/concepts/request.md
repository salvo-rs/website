# Requête

Dans Salvo, les données de requête utilisateur peuvent être obtenues via [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html) :

### Aperçu rapide
Request est une structure représentant une requête HTTP, offrant des capacités complètes de traitement des requêtes :

* Opère sur les attributs de base (URI, méthode, version)
* Gère les en-têtes de requête et les Cookies
* Analyse divers paramètres (chemin, requête, formulaire)
* Prend en charge le traitement du corps de la requête et le téléchargement de fichiers
* Propose plusieurs méthodes d'analyse de données (JSON, formulaire, etc.)
* Implémente une extraction de données unifiée et typée de manière sûre via la méthode extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obtention des paramètres de requête

Les paramètres de requête peuvent être obtenus via `get_query` :

```rust
req.query::<String>("id");
```

## Obtention des données de formulaire

Les données de formulaire peuvent être obtenues via `get_form`. Cette fonction est asynchrone :

```rust
req.form::<String>("id").await;
```

## Obtention des données désérialisées JSON

```rust
req.parse_json::<User>().await;
```

## Extraction des données de requête

`Request` fournit plusieurs méthodes pour analyser ces données en structures fortement typées.

* `parse_params` : Analyse les paramètres de routeur de la requête en un type de données spécifique.
* `parse_queries` : Analyse les requêtes URL de la requête en un type de données spécifique.
* `parse_headers` : Analyse les en-têtes HTTP de la requête en un type de données spécifique.
* `parse_json` : Analyse les données dans la partie corps HTTP de la requête au format JSON en un type spécifique.
* `parse_form` : Analyse les données dans la partie corps HTTP de la requête en tant que Formulaire en un type spécifique.
* `parse_body` : Analyse les données dans la partie corps HTTP en un type spécifique en fonction du `content-type` de la requête.
* `extract` : Peut fusionner différentes sources de données pour analyser un type spécifique.

## Principe d'analyse

Ici, un `serde::Deserializer` personnalisé est utilisé pour extraire des données de structures comme `HashMap<String, String>` et `HashMap<String, Vec<String>>` en types de données spécifiques.

Par exemple : Les `requêtes URL` sont en réalité extraites en tant que type [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` peut être considéré comme une structure de données similaire à `HashMap<String, Vec<String>>`. Si l'URL demandée est `http://localhost/users?id=123&id=234`, et que notre type cible est :

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

Si le type que nous fournissons est :

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Alors les deux `id=123&id=234` seront analysés :

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extracteurs intégrés
Le framework inclut des extracteurs de paramètres de requête intégrés. Ces extracteurs peuvent considérablement simplifier le code pour gérer les requêtes HTTP.

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
    format!("Utilisateur créé avec l'ID {}", user.id)
}
```

#### FormBody
Extrait les données de formulaire du corps de la requête et les désérialise en un type spécifié.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Utilisateur mis à jour avec l'ID {}", user.id)
}
```

#### CookieParam
Extrait une valeur spécifique des Cookies de la requête.

```rust
// Le deuxième paramètre : si true, into_inner() paniquera si la valeur n'existe pas.
// Si false, into_inner() retourne Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID utilisateur depuis le Cookie : {}", user_id.into_inner())
}
```

#### HeaderParam
Extrait une valeur spécifique des en-têtes de la requête.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID utilisateur depuis l'En-tête : {}", user_id.into_inner())
}
```

#### PathParam
Extrait les paramètres du chemin URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID utilisateur depuis le Chemin : {}", id.into_inner())
}
```

#### QueryParam
Extrait les paramètres de la chaîne de requête URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Recherche de l'utilisateur avec l'ID : {}", id.into_inner())
}
```

### Utilisation avancée
Vous pouvez fusionner plusieurs sources de données pour analyser un type spécifique. Tout d'abord, définissez un type personnalisé, par exemple :

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Par défaut, obtient les valeurs des champs depuis le corps.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// L'id est obtenu à partir des paramètres de chemin de la requête et automatiquement analysé en i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Les types référence peuvent être utilisés pour éviter la copie mémoire.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Ensuite, dans un `Handler`, vous pouvez obtenir les données comme ceci :

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Vous pouvez même passer le type directement en tant que paramètre de fonction, comme ceci :

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

Les définitions de types de données offrent une flexibilité considérable, permettant même l'analyse en structures imbriquées selon les besoins :

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
    /// Ce champ imbriqué est entièrement réanalysé depuis la Request.
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

Pour un exemple concret, voir : [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Si dans l'exemple ci-dessus Nested<'a> n'a pas de champs portant les mêmes noms que le parent, vous pouvez utiliser `#[serde(flatten)]`. Sinon, vous devez utiliser `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Vous pouvez également ajouter un paramètre `parse` à `source` pour spécifier une méthode d'analyse particulière. Si ce paramètre n'est pas spécifié, l'analyse est déterminée en fonction des informations de la `Request`. Pour un corps `Form`, il est analysé en tant que `MultiMap` ; pour une charge utile JSON, il est analysé en JSON. Généralement, vous n'avez pas besoin de spécifier ce paramètre. Dans de rares cas, le spécifier peut activer des fonctionnalités spéciales.

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

Par exemple, ici la requête réelle envoie un Formulaire, mais la valeur d'un certain champ est un texte JSON. En spécifiant `parse`, cette chaîne peut être analysée au format JSON.

## Aperçu partiel de l'API. Pour les informations les plus récentes et détaillées, veuillez vous référer à la documentation API des crates.
# Aperçu des méthodes de la structure Request

| Catégorie | Méthode | Description |
|----------|--------|-------------|
| **Informations sur la requête** | `uri()/uri_mut()/set_uri()` | Opérations sur l'URI |
| | `method()/method_mut()` | Opérations sur la méthode HTTP |
| | `version()/version_mut()` | Opérations sur la version HTTP |
| | `scheme()/scheme_mut()` | Opérations sur le schéma de protocole |
| | `remote_addr()/local_addr()` | Informations d'adresse |
| **En-têtes de requête** | `headers()/headers_mut()` | Obtenir tous les en-têtes de requête |
| | `header<T>()/try_header<T>()` | Obtenir et analyser un en-tête spécifique |
| | `add_header()` | Ajouter un en-tête de requête |
| | `content_type()/accept()` | Obtenir le type de contenu/type accepté |
| **Gestion des paramètres** | `params()/param<T>()` | Opérations sur les paramètres de chemin |
| | `queries()/query<T>()` | Opérations sur les paramètres de requête |
| | `form<T>()/form_or_query<T>()` | Opérations sur les données de formulaire |
| **Corps de la requête** | `body()/body_mut()` | Obtenir le corps de la requête |
| | `replace_body()/take_body()` | Modifier/extraire le corps de la requête |
| | `payload()/payload_with_max_size()` | Obtenir les données brutes |
| **Gestion des fichiers** | `file()/files()/all_files()` | Obtenir les fichiers téléchargés |
| | `first_file()` | Obtenir le premier fichier |
| **Analyse des données** | `extract<T>()` | Extraction de données unifiée |
| | `parse_json<T>()/parse_form<T>()` | Analyser JSON/formulaire |
| | `parse_body<T>()` | Analyser intelligemment le corps de la requête |
| | `parse_params<T>()/parse_queries<T>()` | Analyser les paramètres/requêtes |
| **Fonctionnalités spéciales** | `cookies()/cookie()` | Opérations sur les cookies (nécessite la fonctionnalité cookie) |
| | `extensions()/extensions_mut()` | Stockage des données d'extension |
| | `set_secure_max_size()` | Définir la limite de taille sécurisée |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}