# Limitador de velocidad

Middleware que proporciona funcionalidad de control de flujo.


## Características Principales

* `RateIssuer` proporciona una abstracción del valor clave asignado para identificar la identidad del visitante. `RemoteIpIssuer` es una implementación del mismo que puede determinar el visitante en función de la dirección IP solicitada. Los tipos de restricción Eq + Send + Sync + 'static` pueden ser utilizados como llaves.

* `RateGuard` proporciona una abstracción para el algoritmo de control de flujo. De forma predeterminada, se implementan dos implementaciones de ventana fija (`FixedGuard`) y ventana deslizante (`SlidingGuard`).

* `RateStore` proporciona acceso a los datos. `MokaStore` es una implementación de memoria caché integrada basada en `moka`. También puedes definir tu propia implementación.

* `RateLimiter` es una estructura que implementa `Handler`, y también hay un campo `skipper` dentro, que se puede especificar para omitir ciertas solicitudes que no requieren almacenamiento en caché. De forma predeterminada, `none_skipper` se usará para no omitir cualquier solicitud.

* `QuotaGetter` proporciona la abstracción de adquisición de cuota, que puede obtener un objeto de cuota de acuerdo con la `Clave` del visitante, lo que significa que podemos configurar la cuota de usuario y otra información en la base de datos, cambiarla dinámicamente y adquirirla dinámicamente.

* La posibilidad de agregar encabezados de límite de velocidad a la respuesta con la función de instancia [`RateLimiter::add_headers`] agregará los siguientes encabezados a la respuesta:

  | Header                  | Description                                                                                          |
  |-------------------------|------------------------------------------------------------------------------------------------------|
  | `X-RateLimit-Limit`     | El número máximo de solicitudes que el consumidor puede realizar por período de cuota.               |
  | `X-RateLimit-Remaining` | El número de solicitudes que quedan en la ventana de límite de tasa actual.                          |
  | `X-RateLimit-Reset`     | La hora a la que se restablece la ventana de límite de velocidad actual en segundos de la época UTC. |




_**Ejemplo**_ 

### Uso de referencia estática

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-static/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-static/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### Uso de referencia dinámica

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-dynamic/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-dynamic/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

[`RateLimiter::add_headers`]: https://docs.rs/salvo-rate-limiter/0.64.0/salvo_rate_limiter/struct.RateLimiter.html#method.add_headers