# Escritor (Writer)

El `Writer` es usado para escribir contenido en la `Response`:

```rust
#[async_trait]
pub trait Writer {
    async fn write(mut self, req: &mut Request, depot: &mut Depot, res: &mut Response);
}
```

Comparado con `Handler`:

```rust
#[async_trait]
pub trait Handler: Send + Sync + 'static {
    async fn handle(&self, req: &mut Request, depot: &mut Depot, res: &mut Response, ctrl: &mut FlowCtrl);
}
```

Sus diferencias son:

- Diferentes usos, `Writer` representa una escritura específica de contenido en `Response`, que se implementa mediante contenido específico, como cadenas, mensajes de error, entre otros. El `Handler` es usado para procesar la solicitud completamente.
- `Writer` es creado en `Handler`, se consumirá cuando la función `write` sea llamada, es una llamada única. Y `Handler` es común para todas las solicitudes;
- `Writer` puede ser usado como contenido de `Result` retornado por `Handler`;
- El parámetro `FlowCtrl` no existe en el `Writer`, y no controla la ejecución del flujo de la solicitud entera.

El `Scribe` implementa `Writer`, pero con menos funcionalidad que `Writer`:

```rust
pub trait Scribe {
    fn render(self, res: &mut Response);
}
```

Las funciones `Scribe`'s' simplemente escriben datos en `Response`, éste proceso no puede obtener información del `Request` o `Depot`.
