# Enviar archivo

Salvo puede enviar archivos de varias maneras:

### Archivo con nombre

Salvo proporciona ```salvo::::NamedFile```, que se puede utilizar para enviar archivos de manera eficiente al cliente. No carga todos los archivos en el caché, pero carga parte del contenido de acuerdo con el `Range` solicitado enviado al cliente.

En realidad, pasar `Response::send_file` es solo una forma simplificada de usar `NamedFile`; si necesita más control sobre el archivo enviado, puede usar `NamedFileBuilder`.

Se puede crear un `NamedFileBuilder` mediante `NamedFile::builder`:


```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     let builder = NamedFile::builder("/file/to/path");
}
```

Puede realizar algunas configuraciones y luego enviar el archivo:


```rust
#[handler]
async fn send_file(req: &mut Request, res: &mut Response) {
     NamedFile::builder("/file/to/path").attached_name("image.png").send(req.headers(), res).await;
}
```

### Servidor Estático

Middleware que sirve archivos estáticos o archivos incrustados como un servicio.

* `StaticDir` proporciona soporte para carpetas locales estáticas. Puede tomar una lista de varias carpetas como argumento. Por ejemplo:

     <CodeGroup>
     <CodeGroupItem title="main.rs" active>

     @[code rust](../../../../codes/static-dir-list/src/main.rs)

     </CodeGroupItem>
     <CodeGroupItem title="Cargo.toml">

     @[code toml](../../../../codes/static-dir-list/Cargo.toml)

     </CodeGroupItem>
     </CodeGroup>

     Si el archivo correspondiente no se encuentra en la primera carpeta, se encontrará en la segunda carpeta.

* Proporciona soporte para `rust-embed`, como por ejemplo:
   
     <CodeGroup>
     <CodeGroupItem title="main.rs" active>

     @[code rust](../../../../codes/static-embed-files/src/main.rs)

     </CodeGroupItem>
     <CodeGroupItem title="Cargo.toml">

     @[code toml](../../../../codes/static-embed-files/Cargo.toml)

     </CodeGroupItem>
     </CodeGroup>

    `with_fallback` se puede configurar para usar el archivo configurado aquí cuando no se pueda encontrar el archivo. Esto sigue siendo útil para algunas aplicaciones de sitios web de una sola página.