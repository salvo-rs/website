# Pedido

No Salvo, os dados da solicitação do usuário podem ser obtidos através da estrutura [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Visão Rápida
Request é uma estrutura que representa uma solicitação HTTP, oferecendo funcionalidades abrangentes para processamento de solicitações:

* Manipulação de atributos básicos (URI, método, versão)
* Tratamento de cabeçalhos e cookies
* Análise de diversos tipos de parâmetros (caminho, consulta, formulário)
* Suporte a processamento do corpo da solicitação e upload de arquivos
* Oferece múltiplos métodos para análise de dados (JSON, formulários, etc.)
* Permite extração de dados com segurança de tipos através do método extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obter Parâmetros de Consulta

Os parâmetros de consulta podem ser obtidos com `get_query`:

```rust
req.query::<String>("id");
```

## Obter Dados de Formulário

Os dados de formulário podem ser obtidos com `get_form`, que é uma função assíncrona:

```rust
req.form::<String>("id").await;
```

## Obter Dados Desserializados em JSON

```rust
req.parse_json::<User>().await;
```

## Extrair Dados da Solicitação

O `Request` oferece vários métodos para analisar esses dados em estruturas fortemente tipadas.

* `parse_params`: Analisa os parâmetros da rota para um tipo específico;
* `parse_queries`: Analisa os parâmetros da URL para um tipo específico;
* `parse_headers`: Analisa os cabeçalhos HTTP para um tipo específico;
* `parse_json`: Analisa o corpo da solicitação como JSON para um tipo específico;
* `parse_form`: Analisa o corpo da solicitação como formulário para um tipo específico;
* `parse_body`: Analisa o corpo da solicitação com base no `content-type`;
* `extract`: Combina diferentes fontes de dados para extrair um tipo específico.

## Princípio de Análise

Aqui, um `serde::Deserializer` personalizado converte dados como `HashMap<String, String>` e `HashMap<String, Vec<String>>` em tipos específicos.

Por exemplo: `URL queries` são extraídos como um tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html), que pode ser visto como uma estrutura similar a `HashMap<String, Vec<String>>`. Se a URL for `http://localhost/users?id=123&id=234` e o tipo alvo for:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

O primeiro `id=123` será analisado, enquanto `id=234` será descartado:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Se o tipo for:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Ambos `id=123` e `id=234` serão analisados:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extratores Integrados
O framework inclui extratores de parâmetros de solicitação que simplificam o código de processamento de solicitações HTTP.

:::tip
Para usar, adicione o recurso `"oapi"` no seu `Cargo.toml`:
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Então você pode importar os extratores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Extrai dados JSON do corpo da solicitação e os desserializa em um tipo específico.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Usuário criado com ID {}", user.id)
}
```

#### FormBody
Extrai dados de formulário do corpo da solicitação e os desserializa em um tipo específico.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Usuário atualizado com ID {}", user.id)
}
```

#### CookieParam
Extrai um valor específico dos cookies da solicitação.

```rust
// O segundo parâmetro, se true, faz com que into_inner() dispare um panic se o valor não existir.
// Se false, into_inner() retorna Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID do usuário obtido do cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrai um valor específico dos cabeçalhos da solicitação.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID do usuário obtido do cabeçalho: {}", user_id.into_inner())
}
```

#### PathParam
Extrai parâmetros do caminho da URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID do usuário obtido do caminho: {}", id.into_inner())
}
```

#### QueryParam
Extrai parâmetros da string de consulta da URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("Procurando usuário com ID {}", id.into_inner())
}
```

### Uso Avançado
É possível combinar múltiplas fontes de dados para extrair um tipo específico. Primeiro, defina um tipo personalizado:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por padrão, obtém os valores dos campos do corpo.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// O ID é obtido dos parâmetros do caminho e automaticamente analisado como i64.
    #[salvo(extract(source(from = "param"))]
    id: i64,
    /// Pode usar tipos de referência para evitar cópia de memória.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

No `Handler`, os dados podem ser obtidos assim:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Ou até mesmo passar o tipo diretamente como parâmetro da função:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

A definição do tipo de dados é bastante flexível, permitindo até estruturas aninhadas:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    #[salvo(extract(source(from = "param"))]
    id: i64,
    #[salvo(extract(source(from = "query")))]
    username: &'a str,
    first_name: String,
    last_name: String,
    lovers: Vec<String>,
    /// Este campo nested é completamente reanalisado a partir da Request.
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

Para um exemplo completo, veja: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se no exemplo acima `Nested<'a>` não tiver campos em comum com o pai, pode usar `#[serde(flatten)]`, caso contrário, use `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Também é possível adicionar um parâmetro `parse` ao `source` para especificar um método de análise particular. Se não especificado, a análise será baseada nas informações da `Request`: formulários serão analisados como `MuiltMap`, e payloads JSON como JSON. Normalmente, não é necessário especificar este parâmetro, exceto em casos específicos.

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

Por exemplo, se a solicitação enviar um formulário, mas um campo contiver texto JSON, `parse` pode ser usado para analisar esse texto como JSON.

## Visão Geral da API
Para a lista mais recente e detalhada, consulte a documentação da API.

# Métodos da Estrutura Request

| Categoria | Método | Descrição |
|-----------|--------|-----------|
| **Informações da Solicitação** | `uri()/uri_mut()/set_uri()` | Operações de URI |
| | `method()/method_mut()` | Operações de método HTTP |
| | `version()/version_mut()` | Operações de versão HTTP |
| | `scheme()/scheme_mut()` | Operações de esquema |
| | `remote_addr()/local_addr()` | Informações de endereço |
| **Cabeçalhos** | `headers()/headers_mut()` | Obter todos os cabeçalhos |
| | `header<T>()/try_header<T>()` | Obter e analisar cabeçalho específico |
| | `add_header()` | Adicionar cabeçalho |
| | `content_type()/accept()` | Obter tipo de conteúdo/tipo aceito |
| **Parâmetros** | `params()/param<T>()` | Operações de parâmetros de caminho |
| | `queries()/query<T>()` | Operações de parâmetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operações de dados de formulário |
| **Corpo da Solicitação** | `body()/body_mut()` | Obter corpo da solicitação |
| | `replace_body()/take_body()` | Modificar/extrair corpo |
| | `payload()/payload_with_max_size()` | Obter dados brutos |
| **Arquivos** | `file()/files()/all_files()` | Obter arquivos enviados |
| | `first_file()` | Obter primeiro arquivo |
| **Análise de Dados** | `extract<T>()` | Extração unificada de dados |
| | `parse_json<T>()/parse_form<T>()` | Análise de JSON/formulário |
| | `parse_body<T>()` | Análise inteligente do corpo |
| | `parse_params<T>()/parse_queries<T>()` | Análise de parâmetros/consultas |
| **Funcionalidades Especiais** | `cookies()/cookie()` | Operações de cookies (requer recurso cookie) |
| | `extensions()/extensions_mut()` | Armazenamento de dados de extensão |
| | `set_secure_max_size()` | Definir limite de tamanho seguro |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}