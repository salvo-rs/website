# Respuesta (Response)

En `Handler`, [`Response`](https://docs.rs/salvo_core/latest/salvo_core/http/response/struct.Response.html) se pasará como parámetro:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
res.render("¡Hola mundo!");
}
```

`Response` Una vez que el servidor recibe la solicitud del cliente, cualquier `Handler` y middleware coincidentes pueden escribir datos en él. En algunos casos, como un middleware que desea evitar que se ejecuten middleware y `Handler` posteriores, puede usar `FlowCtrl`:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
ctrl.skip_rest();
res.render("¡Hola mundo!");
}
```

## Escribir contenido

Escribir datos en una `Respuesta` es muy simple:

- Escribir datos en texto simple

```rust
res.render("¡Hola mundo!");
```

- Escribir datos serializados en JSON

```rust
use serde::Serialize;
use salvo::prelude::Json;

#[derive(Serialize, Debug)]
struct User {
name: String,
}
let user = User{name: "jobs".to_string()};
res.render(Json(user));
```

- Escribir HTML

```rust
res.render(Text::Html("<html><body>hello</body></html>"));
```

## Cómo escribir errores HTTP

- Use `render` para escribir información detallada de errores en una `Respuesta`.

```rust
use salvo::http::errors::*;
res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
```

- Si no necesita mensajes de error personalizados, puede llamar a `set_http_code` directamente.

```rust
use salvo::http::StatusCode;
res.status_code(StatusCode::BAD_REQUEST);
```

## Redireccionar a otra URL
- Use el método `render` para escribir una respuesta de redireccionamiento a una `Respuesta`, navegando a una nueva URL. Cuando llama al método Redirect::found, establece el código de estado HTTP en 302 (Encontrado), lo que indica una redirección temporal.
```rust
use salvo::prelude::*;

#[handler]
async fn redirect(res: &mut Response) {
res.render(Redirect::found("https://salvo.rs/"));
}
```

## ResBody

El tipo de cuerpo que devuelve Response es `ResBody`, que es una enumeración. Cuando ocurre un error, se establece en `ResBody::Error`, que contiene información sobre el error y se utiliza para retrasar el procesamiento del error. `StatusError` en realidad no implementa `Writer`, pero está diseñado para permitirle personalizar su método de visualización en `Catcher`.
