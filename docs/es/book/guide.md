# Inicio Rápido

## Instalando Rust

Si no tiene Rust, recomendamos usar `rustup` para administrar la instalación de Rust. La [guía ofical de rust](https://doc.rust-lang.org/book/ch01-01-installation.html) tiene mucha documentación para comenzar.

Actualmente Salvo tiene soportada la mínima versión de Rust version 1.80. Corriendo `rustup update` te aseguraras de tener la última versión disponible de Rust. Como tal, esta guía asume que estás ejecutando Rust 1.80 o posterior.

## Escribiendo la primera Aplicación

Crea un nuevo proyecto de Rust:

```bash
cargo new hello_salvo --bin
```

Agrega ésto al archivo `Cargo.toml`

```toml
[package]
name = "hello"
version = "0.1.0"
edition = "2021"
publish = false

[dependencies]
salvo = "0.64.0"
tokio = { version = "1", features = ["macros"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

Cree un controlador de funciones simple en el archivo main.rs, lo llamamos `hello`, ésta función sólo renderiza el texto plano `"Hello world"`. En la función `main`, necesitamos crear un Enrutador primero, y luego crear un servidor y llamar a la función `bind`:

@[code rust](../../../codes/hello/src/main.rs)

Felicidades! Tu primera aplicación ya está lista! Para ejecutarla simplemente corre lo siguiente `cargo run`.

## Más acerca del controlador

Existen muchas formas para escribir una función del tipo controlador.

- La forma original es:

    ```rust
    #[handler]
    async fn hello(_req: &mut Request, _depot: &mut Depot, res: &mut Response, _ctrl: &mut FlowCtrl) {
        res.render("Hello world");
    }
    ```

- Puedes omitir los argumentos como `_req`, `_depot`, `_ctrl` si no los usas como se ve en el siguiente ejemplo:

    ```rust
    #[handler]
    async fn hello(res: &mut Response) {
        res.render("Hello world");
    }
    ```

- El valor de retorno de la función controladora puede ser de cualquier tipo, únicamente debe implementar `Writer`. Por ejemplo `&str` implementa `Writer` y pudiera renderizar un string como un texto plano:

    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> &'static str {// just return &str
        "Hello world"
    }
    ```

- La forma más común es cuando queremos retornar una estructura de datos tipo `Result<T, E>` para manejar los errores. Si `T` y `E` implementan `Writer`, `Result<T, E>` Pueden ser valores de retornos válidos para la función del tipo controladora:

    ```rust
    #[handler]
    async fn hello(res: &mut Response) -> Result<&'static str, ()> {// return Result
        Ok("Hello world")
    }
    ```

## Use HTTP3

Lo primero que necesitas es habilitar la característica `http3` en el archivo `Cargo.toml`, y cambiar el archivo `main.rs` como se ve a continuación:

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/hello-h3/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/hello-h3/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## Prueba más ejemplo

La forma más rápida de empezar a experimentar con Salvo es clonar el
Salvo repositorio y ejecute los ejemplos incluidos en el directorio `examples/`.
Por ejemplo, el siguiente conjunto de comandos ejecuta el ejemplo `hello`.:

```sh
git clone https://github.com/salvo-rs/salvo.git
cd salvo
cargo run --bin example-hello
```

Hay muchos ejemplos en el directorio `examples/`. Todos se pueden ejecutar con`cargo run --bin example-<name>`.
