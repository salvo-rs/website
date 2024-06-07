# Manejador (Handler)

## ¿Qué es un Manejador?

El manejador es un objeto específico reponsable de procesar las solicitudes (requests). EL manejador en si mismo es un `Trait`, que contiene un método asíncrono `handle`:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

La firma predeterminada de la función `handle` contiene cuatro parámetros, en orden, `&mut Request, &mut Depot. &mut Response, &mut FlowCtrl`. Depósito (Depot) es un almacenamiento temporar que puede almacenar datos relacionados a la solicutd (request).

El middleware es también un `Handler`. Ellos pueden realizar algún procesamiento antes o después de que la solictud llegue al `Handler` que oficialmente maneja la solicitud, algo como: verificación de inicio de sesión, compresión de datos, entre otros.

El middleware es agregado a través de la función `hoop` del `Router`. El middleware agregado pudiera afectar la ruta (`Router`) y todos sus descendientes internos `Router`.

## `Handler` como middleware

Cuando el `Handler` es usado como middleware, puede ser agregado a los siguientes tres tipos de objetos que soportan middleware:

- `Service`, cualquier solicitud puede pasar a través de middlewares en `Service`.

- `Router`, sólo cuando coincida la ruta, la solicitud pudiera a través de los middlewares definidos en `Service` y todos los middlewares recolectados en la misma ruta.

- `Catcher`, cuando un error ocurre y no se tiene un manejo personalizado de errores, la solicitud pudiera pasar a través del middleware en `Catcher`.

## Macro `#[handler]`

`#[handler]` puede simplificar muchísimo la escritura del código y agregar flexibilidad al mismo.

El macro puede agregarse a la función para implementar `Handler`:

```rust
#[handler]
async fn hello() -> &'static str {
    "hello world!"
}
```

Lo anterior es equivalente a ésto:

```rust
struct hello;

#[async_trait]
impl Handler for hello {
    async fn handle(&self, _req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
        res.render(Text::Plain("hello world!"));
    }
}
```

Como puedes ver, en el caso de usar `#[handler]`, el código es mucho más simple:

- No necesitas agregar manualmente `#[async_trait]`.
- Los parámetros que no necesitas en la función pueden ser omitidos, y los parámetros requeridos los puedes agregar en cualquier orden.
- Para los objetos que implementan abstracción de `Writer` o `Scribe`, Pueden ser usados directamente como valores de retorno de la función. Aquí `&'static str` implementa `Scribe`, entonces puede ser retornado directamente en la función sin ningún tipo de transformación o casteo.

El macro `#[handler]` no solamente puede ser agregado a la función, sino que también lo puedes agregar a `impl` de `struct` para implementar en el `struct` el `Handler`. En éste momento, la función `handle` en el `impl` pudiera ser identificado como una instancia de `handle` en el `Handler`:

```rust
struct Hello;

#[handler]
impl Hello {
    async fn handle(&self, res: &mut Response) {
        res.render(Text::Plain("hello world!"));
    }
}
```

## Manejo de errores

El `Handler` en Salvo puede retornar `Result`, sólo los tipos de `Ok` y `Err` en `Result` son implementaciones del trait `Writer`.
Teniendo ésto en cuenta, el uso generalizado de `anyhow`, el `Writer` como implementación de `anyhow::Error` se usa por defecto, y `anyhow::Error` es mapeado a `InternalServerError`.

```rust
#[cfg(feature = "anyhow")]
#[async_trait]
impl Writer for ::anyhow::Error {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.render(StatusError::internal_server_error());
    }
}
```

Para manejo de errores personalizados, puedes generar una salida diferente de a cuerdo con lo que necesites.

```rust
use salvo::anyhow;
use salvo::prelude::*;

struct CustomError;
#[async_trait]
impl Writer for CustomError {
    async fn write(mut self, _req: &mut Request, _depot: &mut Depot, res: &mut Response) {
        res.status_code(StatusCode::INTERNAL_SERVER_ERROR);
        res.render("custom error");
    }
}

#[handler]
async fn handle_anyhow() -> Result<(), anyhow::Error> {
    Err(anyhow::anyhow!("anyhow error"))
}
#[handler]
async fn handle_custom() -> Result<(), CustomError> {
    Err(CustomError)
}

#[tokio::main]
async fn main() {
    let router = Router::new()
        .push(Router::new().path("anyhow").get(handle_anyhow))
        .push(Router::new().path("custom").get(handle_custom));
    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    Server::new(acceptor).serve(router).await;
}
```

## Implementación del trait Handle directamente

Bajo ciertas circunstancias, Pudiéramos necesitar implementar el `Handler` directamente.

```rust
use salvo_core::prelude::*;
use crate::salvo_core::http::Body;

pub struct MaxSizeHandler(u64);
#[async_trait]
impl Handler for MaxSizeHandler {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl) {
        if let Some(upper) = req.body().size_hint().upper() {
            if upper > self.0 {
                res.render(StatusError::payload_too_large());
                ctrl.skip_rest();
            } else {
                ctrl.call_next(req, depot, res).await;
            }
        }
    }
}
```
