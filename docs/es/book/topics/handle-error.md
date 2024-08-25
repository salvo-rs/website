# Manejar error

## Manejo de errores generales en aplicaciones Rust

El manejo de errores de Rust es diferente al de lenguajes como Java. No tiene un `try...catch`. La práctica normal es definir un tipo de manejo de errores global a nivel de aplicación:

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("io: `{0}`")]
    Io(#[from] io::Error),
    #[error("utf8: `{0}`")]
    FromUtf8(#[from] FromUtf8Error),
    #[error("diesel: `{0}`")]
    Diesel(#[from] diesel::result::Error),
    ...
}

pub type AppResult<T> = Result<T, AppError>;
```

Aquí se utiliza la biblioteca `thiserror`, que puede definir fácilmente su propio tipo de error personalizado y simplificar el código. Para una escritura sencilla, defina un `AppResult` por cierto.

## Manejo de errores en el controlador

En Salvo, `Handler` a menudo encuentra varios errores, como: error de conexión a la base de datos, error de acceso a archivos, error de conexión de red, etc. Para este tipo de error, se pueden utilizar los métodos de manejo de errores anteriores:

```rust
#[handler]
async fn home()-> AppResult<()> {

}
```
Aquí `home` devuelve directamente un `AppResult<()>`. Sin embargo, ¿cómo mostrar este error? Necesitamos implementar `Writer` para el tipo de error personalizado `AppResult`, en esta implementación podemos decidir cómo mostrar los errores:

```rust
#[async_trait]
impl Writer for AppError {
    async fn write(mut self, _req: &mut Request, depot: &mut Depot, res: &mut Response) {
        res.render(Text::Plain("I'm a error, hahaha!"));
    }
}
```

`Error` a menudo contiene información confidencial; en circunstancias normales, no desea que los usuarios normales lo vean, es demasiado inseguro y no hay privacidad alguna. Sin embargo, si es un desarrollador o un webmaster, puede Piensa que no es lo mismo, quieres que el error te quite el abrigo y te permita ver el mensaje de error más real.

Se puede ver que en el método `write`, podemos obtener las referencias de `Request` y `Depot`, que pueden implementar fácilmente la operación anterior:

```rust
#[async_trait]
impl Writer for AppError {
    async fn write(mut self, _req: &mut Request, depot: &mut Depot, res: &mut Response) {
        let user = depot.obtain::<User>();
        if user.is_admin {
            res.render(Text::Plain(e.to_string()));
        } else {
            res.render(Text::Plain("I'm a error, hahaha!"));
        }
    }
}
```

## Visualización de la página de error

La página de error que viene con Salvo es suficiente en la mayoría de los casos, puede mostrar páginas Html, Json o Xml según el tipo de datos solicitado, sin embargo, en algunos casos, aún esperamos personalizar la visualización de la página de error.

Esto se puede lograr mediante un `Catcher` personalizado. Para obtener una introducción detallada, consulte la explicación en la sección [`Catcher`](../concepts/catcher.html).