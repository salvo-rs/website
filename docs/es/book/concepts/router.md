# Enrutador (Router)

## ¿Qué es un enrutador?

El enrutador puede enrutar solicitudes http a diferentes controladores. Esta es una característica básica y clave de salvo.

El interior del `Router` en realidad está compuesto por una serie de filtros (Filtro). Cuando llega una solicitud, la ruta se probará a sí misma y a sus descendientes para ver si pueden coincidir con la solicitud en el orden en que se agregaron y luego ejecutará el middleware en toda la cadena formada por la ruta y sus descendientes en secuencia. Si el estado de "Respuesta" se establece en error (4XX, 5XX) o salto (3XX) durante el procesamiento, se omitirán el middleware y el `Manejador` posteriores. También puede ajustar manualmente `ctrl.skip_rest()` para omitir el middleware y el `Handler` posteriores.

## Escribir de forma plana

Puedes escribir enrutadores de forma plana como se muestra en el ejemplo:

```rust
Router::with_path("writers").get(list_writers).post(create_writer);
Router::with_path("writers/<id>").get(show_writer).patch(edit_writer).delete(delete_writer);
Router::with_path("writers/<id>/articles").get(list_writer_articles);
```

## Escribir en forma de árbor

Puedes escribir un enrutador en forma de árbol, ésta es la manera recomendada:

```rust
Router::with_path("writers")
    .get(list_writers)
    .post(create_writer)
    .push(
        Router::with_path("<id>")
            .get(show_writer)
            .patch(edit_writer)
            .delete(delete_writer)
            .push(Router::with_path("articles").get(list_writer_articles)),
    );
```

Esta forma de definición puede hacer que la definición de enrutador sea clara y sencilla para proyectos complejos.

Hay muchos métodos en `Router` que pudieran retornar el mismo objeto `Self` después de llamado del mismo, 
para escribir código en una cadena. A veces es necesario decidir cómo realizar la ruta según determinadas condiciones, y el `Router` también provee la función `then`, es fácil usarla:

```rust
Router::new()
    .push(
        Router::with_path("articles")
            .get(list_articles)
            .push(Router::with_path("<id>").get(show_article))
            .then(|router|{
                if admin_mode() {
                    router.post(create_article).push(
                        Router::with_path("<id>").patch(update_article).delete(delete_writer)
                    )
                } else {
                    router
                }
            }),
    );
```

Éste ejemplo muestra de una manera clara que cuando el servidor está en `admin_mode`, las rutas como crear artículos, actualizar y eliminar śerán agregadas dentro del enrutador.

## Obtener parámetros en las rutas

En el código anterior, `<id>` es una definición de un parámetro. Podemos acceder al valor a través de la instancia de la solicitud:

```rust
#[handler]
async fn show_writer(req: &mut Request) {
    let id = req.param::<i64>("id").unwrap();
}
```

`<id>` coincide con un fragmento en la ruta, en circunstancias normales, el artículo `id` es sólo un número, que podemos usar expresiones regulares para restringir `id` con reglas de coincidencia, `r"<id:/\d+/>"`.

Para los caracteres numéricos hay una forma más fácil de usar `<id:num>`, la escritura específica es:

- `<id:num>`, cualquier cantidad de caracteres numéricos;
- `<id:num[10]>`, sólo una cierta cantidad de caracteres numéricos, donde `10` indica la cantidad de caracteres;
- `<id:num(..10)>` de 1 a 9 caracteres numéricos;
- `<id:num(3..10)>` de 3 a 9 caracteres numéricos;
- `<id:num(..=10)>` de 1 a 10 caracteres numéricos;;
- `<id:num(3..=10)>` de 3 a 10 caracteres numéricos;;
- `<id:num(10..)>` al menos 10 caracteres numéricos.

También puedes usar `<**>`, `<*+*>` o `<*?>` para que coincida con todos los fragmentos de la ruta restante.
en orden de hacer el código más legible, también puedes agregar nombres apropiados para hacer que la semántica de la ruta sea mas clara, por ejemplo: `<**file_path>`.

Ésto permite combinar múltiples expresiones en la misma ruta, algo como: `/articles/article_<id:num>/`, `/images/<name>.<ext>`.

## Agregar middlewares

Los Middlewares pueden ser agregados vía `hoop`.

```rust
Router::new()
    .hoop(check_authed)
    .path("writers")
    .get(list_writers)
    .post(create_writer)
    .push(
        Router::with_path("<id>")
            .get(show_writer)
            .patch(edit_writer)
            .delete(delete_writer)
            .push(Router::with_path("articles").get(list_writer_articles)),
    );
```

En este ejemplo, el enrutador raíz tiene un middleware para verificar que el usuario actual esté autenticado. Este middleware afectará al enrutador raíz y a sus descendientes.

Si no queremos verificar que el usuario esté autenticado cuando el usuario actual ve la información y los artículos del escritor. Podemos escribir enrutador así:

```rust
Router::new()
    .push(
        Router::new()
            .hoop(check_authed)
            .path("writers")
            .post(create_writer)
            .push(Router::with_path("<id>").patch(edit_writer).delete(delete_writer)),
    )
    .push(
        Router::new().path("writers").get(list_writers).push(
            Router::with_path("<id>")
                .get(show_writer)
                .push(Router::with_path("articles").get(list_writer_articles)),
        ),
    );
```

Aunque hay dos enrutadores tienen la misma ruta `path("writers")`, ellos pueden ser agregados a la ruta padre al mismo tiempo.

## Filtros

Muchos métodos en `Router` regresan a sí mismos para implementar fácilmente la escritura en cadena. A veces, en algunos casos, es necesario juzgar en función de las condiciones antes de poder agregar rutas. El enrutamiento también proporciona algunos métodos convenientes que simplifican la escritura de código.

`Router` usa el filtro para determinar si la ruta coincide. El filtro admite operaciones lógicas y o. Se pueden agregar varios filtros a una ruta. Cuando todos los filtros agregados coinciden, la ruta coincide correctamente.

Cabe señalar que la colección de URL del sitio web es una estructura de árbol y esta estructura no es equivalente a la estructura de árbol del `Router`. Un nodo de la URL puede corresponder a varios `Router`. Por ejemplo, algunas rutas en la ruta `artículos/` requieren inicio de sesión y algunas rutas no requieren inicio de sesión. Por lo tanto, podemos poner los mismos requisitos de inicio de sesión en un `Router` y, encima, agregar middleware de autenticación en el "Enrutador". Además, puedes acceder a él sin iniciar sesión y colocarlo bajo otra ruta sin middleware de autenticación:

```rust
Router::new()
    .push(
        Router::new()
            .path("articles")
            .get(list_articles)
            .push(Router::new().path("<id>").get(show_article)),
    )
    .push(
        Router::new()
            .path("articles")
            .hoop(auth_check)
            .post(list_articles)
            .push(Router::new().path("<id>").patch(edit_article).delete(delete_article)),
    );
```

El enrutador se utiliza para filtrar solicitudes y luego enviarlas a diferentes controladores para su procesamiento.

Los filtros más comunes son `path` y `method`. `path`; `method`.

Podemos usar `and`, `or` para conectar entre los filtros y las condiciones, por ejemplo:

```rust
Router::new().filter(filters::path("hello").and(filters::get()));
```

### Filtro de Ruta

El filtro es basado en la ruta de la solicitud frecuentemente. Los parámetros pueden ser definidos en el filtro de la ruta, algo como:

```rust
Router::with_path("articles/<id>").get(show_article);
Router::with_path("files/<**rest_path>").get(serve_file)
```

En el `Handler`, puede obtenerse a través de la función `get_param` del objeto `Request`:

```rust
#[handler]
pub async fn show_article(req: &mut Request) {
    let article_id = req.param::<i64>("id");
}

#[handler]
pub async fn serve_file(req: &mut Request) {
    let rest_path = req.param::<i64>("**rest_path");
}
```

### Método `filter`

El filtro de la solicitud basado en el `Method` del servicio `HTTP`, por ejemplo:

```rust
Router::new().get(show_article).patch(update_article).delete(delete_article);
```

Aquí `get`, `patch`, `delete` son todos filtros de métodos, se usaría como:

```rust
use salvo::routing::filter;

let show_router = Router::with_filter(filters::get()).handle(show_article);
let update_router = Router::with_filter(filters::patch()).handle(update_article);
let delete_router = Router::with_filter(filters::get()).handle(delete_article);
Router::new().push(show_router).push(update_router).push(delete_router);
```

## Wisp personalizado

Para algunas expresiones coincidentes que aparecen con frecuencia, podemos nombrar un nombre corto mediante `PathFilter::register_wisp_regex` o `PathFilter::register_wisp_builder`. Por ejemplo, El formato GUID se usa a menudo en las rutas que aparecen, normalmente se escribe así cada vez que se requiere una coincidencia:

```rust
Router::with_path("/articles/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
Router::with_path("/users/<id:/[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/>");
```

Sin embargo, escribir esta compleja expresión regular cada vez es propenso a errores y codificar la expresión regular no es lo ideal. Podríamos separar la expresión regular en su propia variable Regex así:

```rust
use salvo::routing::filter::PathFilter;

#[tokio::main]
async fn main() {
    let guid = regex::Regex::new("[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}").unwrap();
    PathFilter::register_wisp_regex("guid", guid);
    Router::new()
        .push(Router::with_path("/articles/<id:guid>").get(show_article))
        .push(Router::with_path("/users/<id:guid>").get(show_user));
}
```

Solo necesita registrarse una vez y luego puede hacer coincidir directamente el GUID mediante el método de escritura simple como `<id:guid>`, que simplifica la escritura del código.
