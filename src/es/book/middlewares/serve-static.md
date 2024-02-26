# Servidor Estático

Middleware que proporciona archivos estáticos o archivos incrustados como servicios.

## Principales características

* `StaticDir` proporciona soporte para carpetas locales estáticas. Puede tomar una lista de varias carpetas como argumento. Por ejemplo:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-dir-list/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-dir-list/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    Si el archivo correspondiente no se encuentra en la primera carpeta, buscará en la segunda carpeta.
 
    `StaticDir` admite el envío de archivos comprimidos primero cuando existen archivos comprimidos. Por ejemplo, si hay archivos `index.html`, `index.html.gz`, `index.html.zst`, `index.html.br`, entonces `index.html.gz`, `index.html.zst`, `index.html.br` se consideran versiones precomprimidas de `index.html`, y los archivos comprimidos correspondientes se enviarán de acuerdo con el información requerida.

* Proporciona soporte para `rust-embed`, como por ejemplo:

    <CodeGroup>
    <CodeGroupItem title="main.rs" active>

    @[code rust](../../../../codes/static-embed-files/src/main.rs)

    </CodeGroupItem>
    <CodeGroupItem title="Cargo.toml">

    @[code toml](../../../../codes/static-embed-files/Cargo.toml)

    </CodeGroupItem>
    </CodeGroup>

    `with_fallback` se puede configurar para reemplazar el archivo configurado aquí cuando no se encuentra el archivo, lo cual es útil para algunas aplicaciones de sitios web de una sola página.