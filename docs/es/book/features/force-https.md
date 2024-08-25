# Forzar HTTPS

El middleware `force-https` puede forzar que todas las solicitudes utilicen el protocolo HTTPS.

Si este middleware se aplica a `Router`, el protocolo se verá obligado a realizar la conversión solo cuando la ruta coincida. Si la página no existe, no se redirigirá.

Pero un requisito más común es esperar que cualquier solicitud se redirija automáticamente, incluso cuando la ruta no coincida y devuelva un error `404`. En este momento, puede agregar el middleware a `Service`. Independientemente de si la ruta coincide con la solicitud, el middleware agregado a `Service` siempre se ejecutará.

_**Código de muestra**_

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[código rust](../../../../codes/force-https/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[código rust](../../../../codes/force-https/Cargo.toml)

</CodeGroupItem> </CodeGroup>