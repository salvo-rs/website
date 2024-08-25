# Capturador

Si el código de estado de `Response` es un error y el `Body` de la página está vacío, salvo intentará usar `Catcher` para capturar el error y mostrar una página de error amigable.

Puede devolver un `Catcher` predeterminado del sistema a través de `Catcher::default()` y luego agregarlo a `Service`.

```rust
use salvo::catcher::Catcher;

Service::new(router).catcher(Catcher::default());
```

El `Catcher` predeterminado admite el envío de páginas de error en formatos `XML`, `JSON`, `HTML`, `Text`.

Puede agregar un receptor de errores personalizado a `Catcher` agregando `hoop` al `Catcher` predeterminado. Este receptor de errores sigue siendo un `Handler`.

Puede agregar múltiples receptores de errores personalizados a `Catcher` a través de `hoop`. Los controladores de errores personalizados se pueden llamar después de manejar errores. El método `FlowCtrl::skip_next` omite el programa de error subsiguiente y regresa antes.

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

</CodeGroupItem>
</CodeGroup>