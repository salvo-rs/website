# Capturador

Si el código de estatus `Response` es un error, y el `Body` de `Response` se encuentra vacio, entonces salvo pudiera intentar usar el `Catcher` para capturar el error y mostrar una página de error amigable.

Una forma fácil para crear un `Catcher` personalizado es retornar `Catcher` el predeterminado del sistema vía `Catcher::default()`, y agregar éste al  `Service` como se muestra a continuación.

```rust
use salvo::catcher::Catcher;

Service::new(router).with_catcher(Catcher::default());
```

Por defecto `Catcher` soporta envío de página de erroresen formato `XML`, `JSON`, `HTML` y `Text` .

Puedes agregar un manejador de errores personalizados al `Catcher` agregando en el `hoop` por defecto el `Catcher`. El manejador de errores se encuentra en `Handler`.

Puedes agregar múltiples manejadores de errores personalizados al `Catcher` a través de `hoop`. El controlador de errores personalizado puede llamar al método `FlowCtrl::skip_next` después de controlar el error para omitir los siguientes errores.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
