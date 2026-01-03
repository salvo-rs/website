# Pedido

No Salvo, os dados de pedido do utilizador podem ser obtidos através de [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Visão Geral Rápida
Request é uma estrutura que representa um pedido HTTP, fornecendo capacidades abrangentes de processamento de pedidos:

* Opera em atributos básicos (URI, método, versão)
* Processa cabeçalhos de pedido e Cookies
* Analisa vários parâmetros (caminho, consulta, formulário)
* Suporta processamento do corpo do pedido e uploads de ficheiros
* Oferece múltiplos métodos de análise de dados (JSON, formulário, etc.)
* Implementa extração de dados unificada e segura em tipos através do método extract

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obter Parâmetros de Consulta

Os parâmetros de consulta podem ser obtidos via `get_query`:

```rust
req.query::<String>("id");
```

## Obter Dados de Formulário

Os dados de formulário podem ser obtidos via `get_form`. Esta função é assíncrona:

```rust
req.form::<String>("id").await;
```

## Obter Dados Desserializados JSON

```rust
req.parse_json::<User>().await;
```

## Extrair Dados do Pedido

`Request` fornece múltiplos métodos para analisar estes dados em estruturas fortemente tipadas.

* `parse_params`: Analisa os parâmetros de roteamento do pedido num tipo de dados específico.
* `parse_queries`: Analisa as consultas URL do pedido num tipo de dados específico.
* `parse_headers`: Analisa os cabeçalhos HTTP do pedido num tipo de dados específico.
* `parse_json`: Analisa os dados na parte do corpo HTTP do pedido no formato JSON para um tipo específico.
* `parse_form`: Analisa os dados na parte do corpo HTTP do pedido como um Formulário para um tipo específico.
* `parse_body`: Analisa os dados na parte do corpo HTTP para um tipo específico com base no `content-type` do pedido.
* `extract`: Pode combinar diferentes fontes de dados para analisar um tipo específico.

## Princípio de Análise

Aqui, é usado um `serde::Deserializer` personalizado para extrair dados de estruturas como `HashMap<String, String>` e `HashMap<String, Vec<String>>` para tipos de dados específicos.

Por exemplo: `Consultas URL` são na verdade extraídas como um tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` pode ser pensado como uma estrutura de dados semelhante a `HashMap<String, Vec<String>>`. Se o URL solicitado for `http://localhost/users?id=123&id=234`, e o nosso tipo alvo for:

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

Então o primeiro `id=123` será analisado, e `id=234` será descartado:

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

Se o tipo que fornecemos for:

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

Então ambos `id=123&id=234` serão analisados:

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### Extratores Integrados
O framework inclui extratores de parâmetros de pedido integrados. Estes extratores podem simplificar significativamente o código para lidar com pedidos HTTP.

:::tip
Para usá-los, precisa adicionar a funcionalidade `"oapi"` no seu `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Depois pode importar os extratores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Usado para extrair dados JSON do corpo do pedido e desserializá-los num tipo especificado.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Criado utilizador com ID {}", user.id)
}
```

#### FormBody
Extrai dados de formulário do corpo do pedido e desserializa-os num tipo especificado.

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("Atualizado utilizador com ID {}", user.id)
}
```

#### CookieParam
Extrai um valor específico dos Cookies do pedido.

```rust
// O segundo parâmetro: se verdadeiro, into_inner() entrará em pânico se o valor não existir.
// Se falso, into_inner() retorna Option<T>.
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("ID do Utilizador do Cookie: {}", user_id.into_inner())
}
```

#### HeaderParam
Extrai um valor específico dos cabeçalhos do pedido.

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("ID do Utilizador do Cabeçalho: {}", user_id.into_inner())
}
```

#### PathParam
Extrai parâmetros do caminho URL.

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("ID do Utilizador do Caminho: {}", id.into_inner())
}
```

#### QueryParam
Extrai parâmetros da string de consulta URL.

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("A procurar utilizador com ID: {}", id.into_inner())
}
```

### Uso Avançado
Pode combinar múltiplas fontes de dados para analisar um tipo específico. Primeiro, defina um tipo personalizado, por exemplo:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por padrão, obtém valores de campo do corpo.
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// O id é obtido dos parâmetros do caminho do pedido e automaticamente analisado como i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Tipos de referência podem ser usados para evitar cópia de memória.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Depois num `Handler`, pode obter os dados assim:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Pode até passar o tipo diretamente como um parâmetro de função, assim:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

As definições de tipo de dados oferecem flexibilidade considerável, permitindo até analisar em estruturas aninhadas conforme necessário:

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
    /// Este campo aninhado é analisado inteiramente do Request novamente.
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

Para um exemplo concreto, veja: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se no exemplo acima Nested<'a> não tiver campos com os mesmos nomes que o pai, pode usar `#[serde(flatten)]`. Caso contrário, precisa usar `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Também pode adicionar um parâmetro `parse` ao `source` para especificar um método de análise particular. Se este parâmetro não for especificado, a análise é determinada com base na informação do `Request`. Para um corpo `Form`, é analisado como `MultiMap`; para uma carga útil JSON, é analisado como JSON. Geralmente, não precisa especificar este parâmetro. Em casos raros, especificá-lo pode permitir funcionalidade especial.

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

Por exemplo, aqui o pedido real envia um Formulário, mas o valor de um certo campo é um pedaço de texto JSON. Ao especificar `parse`, esta string pode ser analisada no formato JSON.

## Visão Geral Parcial da API. Para a informação mais recente e detalhada, consulte a documentação da API de crates.
# Visão Geral dos Métodos da Estrutura Request

| Categoria | Método | Descrição |
|----------|--------|-------------|
| **Informação do Pedido** | `uri()/uri_mut()/set_uri()` | Operações URI |
| | `method()/method_mut()` | Operações método HTTP |
| | `version()/version_mut()` | Operações versão HTTP |
| | `scheme()/scheme_mut()` | Operações esquema de protocolo |
| | `remote_addr()/local_addr()` | Informação de endereço |
| **Cabeçalhos do Pedido** | `headers()/headers_mut()` | Obter todos os cabeçalhos do pedido |
| | `header<T>()/try_header<T>()` | Obter e analisar um cabeçalho específico |
| | `add_header()` | Adicionar um cabeçalho de pedido |
| | `content_type()/accept()` | Obter tipo de conteúdo/tipo aceite |
| **Manipulação de Parâmetros** | `params()/param<T>()` | Operações parâmetros de caminho |
| | `queries()/query<T>()` | Operações parâmetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operações dados de formulário |
| **Corpo do Pedido** | `body()/body_mut()` | Obter o corpo do pedido |
| | `replace_body()/take_body()` | Modificar/extrair o corpo do pedido |
| | `payload()/payload_with_max_size()` | Obter dados brutos |
| **Manipulação de Ficheiros** | `file()/files()/all_files()` | Obter ficheiros enviados |
| | `first_file()` | Obter o primeiro ficheiro |
| **Análise de Dados** | `extract<T>()` | Extração de dados unificada |
| | `parse_json<T>()/parse_form<T>()` | Analisar JSON/formulário |
| | `parse_body<T>()` | Analisar inteligentemente o corpo do pedido |
| | `parse_params<T>()/parse_queries<T>()` | Analisar parâmetros/consultas |
| **Funcionalidades Especiais** | `cookies()/cookie()` | Operações Cookie (requer funcionalidade cookie) |
| | `extensions()/extensions_mut()` | Armazenamento de dados de extensão |
| | `set_secure_max_size()` | Definir limite de tamanho seguro |
{/* Auto generated, origin file hash:e55635b7ec304fa5b47cf54c4e71d0f5 */}