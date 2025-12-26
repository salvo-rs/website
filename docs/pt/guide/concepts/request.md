# Pedido

No Salvo, os dados da solicitação do usuário podem ser obtidos através de [`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html):

### Compreensão Rápida
`Request` é uma estrutura que representa uma solicitação HTTP, fornecendo funcionalidades abrangentes para processamento de solicitações:

* Manipula atributos básicos (URI, método, versão)
* Processa cabeçalhos e cookies da solicitação
* Analisa vários tipos de parâmetros (caminho, consulta, formulário)
* Suporta processamento do corpo da solicitação e upload de arquivos
* Oferece vários métodos de análise de dados (JSON, formulário, etc.)
* Implementa extração de dados com segurança de tipos unificada através do método `extract`

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## Obter Parâmetros de Consulta

Os parâmetros de consulta podem ser obtidos através de `get_query`:

```rust
req.query::<String>("id");
```

## Obter Dados de Formulário

Os dados do formulário podem ser obtidos através de `get_form`, esta função é assíncrona:

```rust
req.form::<String>("id").await;
```

## Obter Dados Desserializados JSON

```rust
req.parse_json::<User>().await;
```

## Extrair Dados da Solicitação

`Request` fornece vários métodos para analisar esses dados em estruturas fortemente tipadas.

* `parse_params`: Analisa os parâmetros da rota da solicitação em um tipo de dados específico;
* `parse_queries`: Analisa as consultas da URL da solicitação em um tipo de dados específico;
* `parse_headers`: Analisa os cabeçalhos HTTP da solicitação em um tipo de dados específico;
* `parse_json`: Analisa os dados da parte do corpo HTTP da solicitação como formato JSON para um tipo específico;
* `parse_form`: Analisa os dados da parte do corpo HTTP da solicitação como formulário para um tipo específico;
* `parse_body`: Analisa os dados da parte do corpo HTTP da solicitação em um tipo específico com base no `content-type` da solicitação.
* `extract`: Pode combinar diferentes fontes de dados para analisar um tipo específico.

## Princípio de Análise

Aqui, um `serde::Deserializer` personalizado é usado para extrair dados como `HashMap<String, String>` e `HashMap<String, Vec<String>>` em tipos de dados específicos.

Por exemplo: `URL queries` são na verdade extraídas como um tipo [MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html). `MultiMap` pode ser considerado como uma estrutura de dados semelhante a `HashMap<String, Vec<String>>`. Se a URL da solicitação for `http://localhost/users?id=123&id=234` e o tipo de destino fornecido for:

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

Se o tipo fornecido for:

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
O framework possui extratores de parâmetros de solicitação integrados. Esses extratores podem simplificar significativamente o código de processamento de solicitações HTTP.

:::tip
Para usar, você precisa adicionar o recurso `"oapi"` no seu `Cargo.toml`
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

Então você pode importar os extratores:
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
Usado para extrair dados JSON do corpo da solicitação e desserializá-los em um tipo especificado.

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("Usuário criado com ID {}", user.id)
}
```

#### FormBody
Extrai dados de formulário do corpo da solicitação e os desserializa em um tipo especificado.

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
// O segundo parâmetro, quando `true`, fará com que `into_inner()` entre em pânico se o valor não existir; quando `false`,
// o método `into_inner()` retorna `Option<T>`.
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
É possível combinar várias fontes de dados para analisar um tipo específico. Primeiro, defina um tipo personalizado, por exemplo:

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// Por padrão, obtém valores de campo de dados do corpo
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// Aqui, o ID é obtido dos parâmetros do caminho da solicitação e analisado automaticamente como i64.
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// Tipos de referência podem ser usados para evitar cópia de memória.
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

Então, no `Handler`, os dados podem ser obtidos assim:

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

Ou até mesmo passar o tipo diretamente como parâmetro da função, assim:

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

A definição do tipo de dados é bastante flexível, permitindo até mesmo análise em estruturas aninhadas conforme necessário:

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
    /// Este campo `nested` é completamente reanalisado a partir do Request.
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

Veja um exemplo específico em: [extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs).

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

Se no exemplo acima `Nested<'a>` não tiver campos idênticos ao pai, você pode usar `#[serde(flatten)]`, caso contrário, use `#[salvo(extract(flatten))]`.

### `#[salvo(extract(source(parse)))]`

Na verdade, também é possível adicionar um parâmetro `parse` ao `source` para especificar um método de análise particular. Se este parâmetro não for especificado, a análise será determinada pelas informações do `Request`. Se for um formulário, será analisado como `MultiMap`; se for um payload JSON, será analisado como JSON. Geralmente, não é necessário especificar este parâmetro, mas em casos muito específicos, ele pode permitir funcionalidades especiais.

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

Por exemplo, aqui a solicitação real é um Form, mas o valor de um determinado campo é um texto JSON. Nesse caso, especificando `parse`, essa string pode ser analisada como JSON.

## Visão Geral de Algumas APIs, consulte a documentação da crate para as informações mais recentes e detalhadas
# Visão Geral dos Métodos da Estrutura Request

| Categoria | Método | Descrição |
|------|------|------|
| **Informações da Solicitação** | `uri()/uri_mut()/set_uri()` | Operações de URI |
| | `method()/method_mut()` | Operações de método HTTP |
| | `version()/version_mut()` | Operações de versão HTTP |
| | `scheme()/scheme_mut()` | Operações de esquema de protocolo |
| | `remote_addr()/local_addr()` | Informações de endereço |
| **Cabeçalhos da Solicitação** | `headers()/headers_mut()` | Obtém todos os cabeçalhos da solicitação |
| | `header<T>()/try_header<T>()` | Obtém e analisa um cabeçalho específico |
| | `add_header()` | Adiciona um cabeçalho da solicitação |
| | `content_type()/accept()` | Obtém tipo de conteúdo/tipo aceito |
| **Processamento de Parâmetros** | `params()/param<T>()` | Operações com parâmetros de caminho |
| | `queries()/query<T>()` | Operações com parâmetros de consulta |
| | `form<T>()/form_or_query<T>()` | Operações com dados de formulário |
| **Corpo da Solicitação** | `body()/body_mut()` | Obtém o corpo da solicitação |
| | `replace_body()/take_body()` | Modifica/extrai o corpo da solicitação |
| | `payload()/payload_with_max_size()` | Obtém dados brutos |
| **Processamento de Arquivos** | `file()/files()/all_files()` | Obtém arquivos enviados |
| | `first_file()` | Obtém o primeiro arquivo |
| **Análise de Dados** | `extract<T>()` | Extração unificada de dados |
| | `parse_json<T>()/parse_form<T>()` | Analisa JSON/formulário |
| | `parse_body<T>()` | Análise inteligente do corpo da solicitação |
| | `parse_params<T>()/parse_queries<T>()` | Analisa parâmetros/consultas |
| **Funcionalidades Especiais** | `cookies()/cookie()` | Operações com cookies (requer recurso cookie) |
| | `extensions()/extensions_mut()` | Armazenamento de dados de extensão |
| | `set_secure_max_size()` | Define limite de tamanho seguro |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}