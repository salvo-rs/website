# Respuesta (Response)

Podemos obtener la referencia de respuesta como parámetro del manejador de la función:

```rust
#[handler]
async fn hello_world(res: &mut Response) {
    res.render("hello world!");
}
```

Cuando el servidor obtiene una solicitud de un cliente pero solo necesitas retornar una simple respuesta (es decir, omitir cualquier middleware u otro manejador), puedes simplemente usar `FlowCtrl`:

```rust
#[handler]
async fn hello_world(res: &mut Response, ctrl: &mut FlowCtrl) {
    ctrl.skip_rest();
    res.render("hello world!");
}
```

## Escribir contenido (Write content)

Escribe contenido directamente:

- Para escribir un texto plano:

    ```rust
    res.render("hello world!");
    ```

- Para escribir una serialización de un objeto con formato `json`

    ```rust
    #[derive(Serialize, Debug)]
    struct User {
        name: String,
    }
    let user = User{name: "jobs".to_string()};
    res.render(Json(user));
    ```

- Para escribir un texto en formato `html`

    ```rust
    res.render(Text::Html("<html><body>hello</body></html>"));
    ```

## Escribir un estado de error

- El uso de `render` puede escribir una respuesta tipo http error.

    ```rust
    use salvo::http::errors::*;
    res.render(StatusError::internal_server_error().brief("error when serialize object to json"))
    ```

- Si no quieres personalizar el mensaje de error, solo usa el `status_code`.

    ```rust
    use salvo::http::StatusCode;
    res.status_code(StatusCode::BAD_REQUEST);
    ```

## Redireccionar a Otra URL
- Utiliza el método ```render``` para escribir una respuesta de redirección en ```Response```, que navega hacia una nueva URL. Al invocar el método Redirect::found, se establece el código de estado HTTP en 302 (Found), lo que indica un redireccionamiento temporal.
    ```rust
    use salvo::prelude::*;

    #[handler]
    async fn redirect(res: &mut Response) {
        res.render(Redirect::found("https://salvo.rs/"));
    }
    ```