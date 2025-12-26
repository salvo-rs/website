# リクエスト

Salvoでは、[`Request`](https://docs.rs/salvo_core/latest/salvo_core/http/request/struct.Request.html)を通じてユーザーリクエストのデータを取得できます：

### 概要
RequestはHTTPリクエストを表す構造体で、包括的なリクエスト処理機能を提供します：

* 基本属性の操作（URI、メソッド、バージョン）
* リクエストヘッダーとCookieの処理
* 各種パラメータの解析（パス、クエリ、フォーム）
* リクエストボディの処理とファイルアップロードのサポート
* 多様なデータ解析方法の提供（JSON、フォームなど）
* extractメソッドによる統一された型安全なデータ抽出の実現

```rust
#[handler]
async fn hello(req: &mut Request) -> String {
    req.params().get("id").cloned().unwrap_or_default()
}
```

## クエリパラメータの取得

`get_query`を使用してクエリパラメータを取得できます：

```rust
req.query::<String>("id");
```

## フォームデータの取得

`get_form`を使用してフォームデータを取得できます。この関数は非同期関数です：

```rust
req.form::<String>("id").await;
```

## JSONデシリアライズデータの取得

```rust
req.parse_json::<User>().await;
```

## リクエストデータの抽出

`Request`は、これらのデータを強力な型付き構造体に解析するための複数のメソッドを提供します。

* `parse_params`: リクエストのルーターパラメータを特定のデータ型に解析します。
* `parse_queries`: リクエストのURLクエリを特定のデータ型に解析します。
* `parse_headers`: リクエストのHTTPヘッダーを特定のデータ型に解析します。
* `parse_json`: リクエストのHTTPボディ部分のデータをJSON形式として解析し、特定の型に変換します。
* `parse_form`: リクエストのHTTPボディ部分のデータをフォームとして解析し、特定の型に変換します。
* `parse_body`: リクエストの`content-type`に基づいて、HTTPボディ部分のデータを特定の型に解析します。
* `extract`: 異なるデータソースを統合して特定の型を解析できます。

## 解析の原理

ここでは、カスタムの`serde::Deserializer`を使用して、`HashMap<String, String>`や`HashMap<String, Vec<String>>`のようなデータを特定のデータ型に抽出します。

例えば、`URL queries`は実際には[MultiMap](https://docs.rs/multimap/latest/multimap/struct.MultiMap.html)型として抽出されます。`MultiMap`は`HashMap<String, Vec<String>>`に似たデータ構造と考えることができます。リクエストURLが`http://localhost/users?id=123&id=234`で、提供されるターゲット型が以下の場合：

```rust
#[derive(Deserialize)]
struct User {
  id: i64
}
```

最初の`id=123`が解析され、`id=234`は破棄されます：

```rust
let user: User = req.parse_queries().unwrap();
assert_eq!(user.id, 123);
```

提供される型が以下の場合：

```rust
#[derive(Deserialize)]
struct Users {
  ids: Vec<i64>
}
```

`id=123&id=234`の両方が解析されます：

```rust
let users: Users = req.parse_queries().unwrap();
assert_eq!(user.ids, vec![123, 234]);
```

### 組み込みエクストラクタ
フレームワークにはリクエストパラメータエクストラクタが組み込まれており、HTTPリクエスト処理のコードを大幅に簡素化できます。

:::tip
使用するには、`Cargo.toml`に`"oapi" feature`を追加する必要があります。
```rust
salvo = {version = "*", features = ["oapi"]}
```
:::

その後、エクストラクタをインポートできます：
```rust
use salvo::{oapi::extract::JsonBody, prelude::*};
```

#### JsonBody
リクエストボディからJSONデータを抽出し、指定された型にデシリアライズします。

```rust
#[handler]
async fn create_user(json: JsonBody<User>) -> String {
    let user = json.into_inner();
    format!("ID {} のユーザーを作成しました", user.id)
}
```

#### FormBody
リクエストボディからフォームデータを抽出し、指定された型にデシリアライズします。

```rust
#[handler]
async fn update_user(form: FormBody<User>) -> String {
    let user = form.into_inner();
    format!("ID {} のユーザーを更新しました", user.id)
}
```

#### CookieParam
リクエストのCookieから特定の値を抽出します。

```rust
// 2番目のパラメータがtrueの場合、値が存在しないとinto_inner()がpanicします。
// falseの場合、into_inner()メソッドはOption<T>を返します。
#[handler]
fn get_user_from_cookie(user_id: CookieParam<i64,true>) -> String {
    format!("Cookieから取得したユーザーID: {}", user_id.into_inner())
}
```

#### HeaderParam
リクエストヘッダーから特定の値を抽出します。

```rust
#[handler]
fn get_user_from_header(user_id: HeaderParam<i64,true>) -> String {
    format!("リクエストヘッダーから取得したユーザーID: {}", user_id.into_inner())
}
```

#### PathParam
URLパスからパラメータを抽出します。

```rust
#[handler]
fn get_user(id: PathParam<i64>) -> String {
    format!("パスから取得したユーザーID: {}", id.into_inner())
}
```

#### QueryParam
URLクエリ文字列からパラメータを抽出します。

```rust
#[handler]
fn search_user(id: QueryParam<i64,true>) -> String {
    format!("ID {} のユーザーを検索中", id.into_inner())
}
```

### 高度な使用法
複数のデータソースを統合して特定の型を解析できます。まず、カスタム型を定義します：

```rust
#[derive(Serialize, Deserialize, Extractible, Debug)]
/// デフォルトではボディからデータフィールドの値を取得します
#[salvo(extract(default_source(from = "body")))]
struct GoodMan<'a> {
    /// idはリクエストパスパラメータから取得され、自動的にi64型に解析されます。
    #[salvo(extract(source(from = "param")))]
    id: i64,
    /// 参照型を使用してメモリコピーを回避できます。
    username: &'a str,
    first_name: String,
    last_name: String,
}
```

その後、`Handler`内で以下のようにデータを取得できます：

```rust
#[handler]
async fn edit(req: &mut Request) {
    let good_man: GoodMan<'_> = req.extract().await.unwrap();
}
```

さらに、型を直接関数のパラメータとして渡すこともできます：

```rust
#[handler]
async fn edit<'a>(good_man: GoodMan<'a>) {
    res.render(Json(good_man));
}
```

データ型の定義は非常に柔軟で、必要に応じてネストされた構造に解析することもできます：

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
    /// このnestedフィールドは完全にRequestから再解析されます。
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

具体的な例については、[extract-nested](https://github.com/salvo-rs/salvo/blob/main/examples/extract-nested/src/main.rs)を参照してください。

### `#[salvo(extract(flatten))]` VS `#[serde(flatten)]`

上記の例でNested<'a>が親と同じフィールドを持たない場合、`#[serde(flatten)]`を使用できます。それ以外の場合は`#[salvo(extract(flatten))]`を使用する必要があります。

### `#[salvo(extract(source(parse)))]`

実際には、`source`に`parse`パラメータを追加して特定の解析方法を指定することもできます。このパラメータを指定しない場合、解析は`Request`の情報に基づいて`Body`部分の解析方法を決定します。フォームの場合は`MuiltMap`として解析し、JSONペイロードの場合はJSON形式で解析します。通常はこのパラメータを指定する必要はありませんが、特定の場合に指定することで特殊な機能を実現できます。

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

例えば、実際のリクエストがフォームで送信されたが、特定のフィールドの値がJSONテキストである場合、`parse`を指定することでこの文字列をJSON形式で解析できます。

## API一部紹介、最新かつ詳細な情報はcrates apiドキュメントを参照してください
# Request 構造体メソッド概要

| カテゴリ | メソッド | 説明 |
|------|------|------|
| **リクエスト情報** | `uri()/uri_mut()/set_uri()` | URI 操作 |
| | `method()/method_mut()` | HTTP メソッド操作 |
| | `version()/version_mut()` | HTTP バージョン操作 |
| | `scheme()/scheme_mut()` | プロトコルスキーム操作 |
| | `remote_addr()/local_addr()` | アドレス情報 |
| **リクエストヘッダー** | `headers()/headers_mut()` | 全リクエストヘッダー取得 |
| | `header<T>()/try_header<T>()` | 特定ヘッダーの取得と解析 |
| | `add_header()` | リクエストヘッダー追加 |
| | `content_type()/accept()` | コンテンツタイプ/受け入れタイプ取得 |
| **パラメータ処理** | `params()/param<T>()` | パスパラメータ操作 |
| | `queries()/query<T>()` | クエリパラメータ操作 |
| | `form<T>()/form_or_query<T>()` | フォームデータ操作 |
| **リクエストボディ** | `body()/body_mut()` | リクエストボディ取得 |
| | `replace_body()/take_body()` | リクエストボディ変更/抽出 |
| | `payload()/payload_with_max_size()` | 生データ取得 |
| **ファイル処理** | `file()/files()/all_files()` | アップロードファイル取得 |
| | `first_file()` | 最初のファイル取得 |
| **データ解析** | `extract<T>()` | 統一データ抽出 |
| | `parse_json<T>()/parse_form<T>()` | JSON/フォーム解析 |
| | `parse_body<T>()` | インテリジェントリクエストボディ解析 |
| | `parse_params<T>()/parse_queries<T>()` | パラメータ/クエリ解析 |
| **特殊機能** | `cookies()/cookie()` | Cookie 操作 (cookie featureが必要) |
| | `extensions()/extensions_mut()` | 拡張データストレージ |
| | `set_secure_max_size()` | セキュアサイズ制限設定 |
{/* 本行由工具自动生成,原文哈希值:6b654f79df08ba1dc5cc1c070780def0 */}