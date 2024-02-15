# Caché

Es un Middleware que provee funcionalidad de caché.

El middleware de caché puede proporcionar una función de almacenamiento en caché para `StatusCode`, `Headers` y `Body` en `Response`. Para el contenido que se ha almacenado en caché, la próxima vez que procese la solicitud, el middleware de caché enviará directamente el contenido almacenado en caché en la memoria al cliente.

Tenga en cuenta que este complemento no almacenará en caché la `Response` cuyo `body` sea un `ResBody::Stream`. Si se aplica a una `Response` de este tipo, la caché no procesará estas solicitudes y no provocará errores.

## Características Principales

* El `CacheIssuer` proporciona una abstracción sobre las claves de caché asignadas. `RequestIssuer` es una implementación del mismo que define qué partes de la URL solicitada y la URL solicitada `Method`. También puedes definir tu propia lógica de generación de claves de caché. La clave de caché no tiene que ser un tipo de cadena, cualquier tipo que satisfaga las restricciones de `Hash + Eq + Send + Sync + 'static` también pueden ser usados como claves.

* El `CacheStore` provee acceso a los datos. `MokaStore` está incorporado en `moka`-basado en la implementación del caché. También puedes definir tu propia implementación.

* El `Cache` es una estructura que implementa el `Handler`, y hay un campo `skipper` dentro de él, 
que se puede especificar para omitir ciertas solicitudes que no necesitan almacenarse en caché. Por defecto, `MethodSkipper` pudiera ser usado para omitir todas las solicitudes excepto `Method::GET`.

  La implementación interna del código es:

  ```rust
  impl<S, I> Cache<S, I> {
    pub fn new(store: S, issuer: I) -> Self {
        let skipper = MethodSkipper::new().skip_all().skip_get(false);
        Cache {
            store,
            issuer,
            skipper: Box::new(skipper),
        }
    }
  }
  ```

_**Ejemplo**_

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cache-simple/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cache-simple/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
