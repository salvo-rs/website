# Depósito (Depot)

Un depósito es usado para almacenar datos cuando se procesa la solicitud (request). Es muy útil para compartir datos entre los middlewares.

La instancia del depósito es creada cuando el servidor recibe la solicitud del cliente y será eliminada cuando la solicitud (request) hay sido procesada.

Por ejemplo, queremos establecer `current_user` en `set_user`, y entonces usar éste valor en los siguientes middlewares para manipular.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/use-depot/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/use-depot/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## Establecer y recuperar datos vía `insert` y `get`

  Como se muestra arriba, `key` y `value` pueden ser insertadas dentro de `Depot` vía `insert`. Para valores de éste tipo, `get` puede ser usado para recuperarlo directamente.

```rust
depot.insert("a", "b");
assert_eq!(depot.get::<&str>("a").copied().unwrap(), "b")
```

  Returns `None` if the `key` does not exist, or if the `key` exists, but the types do not match.

## Establecer y recuperar datos vía `inject` y `obtain`

A veces, hay casos donde no necesariamente requieres especificar `key`, y también hay una única instancia del tipo. Para ésto puedes usar `inject` para inyectar los datos, y `obtain` para recuperar los datos. Ellos permiten insertar y recuperar datos sin utilizar `key`.

```rust
depot.inject(Config::new());
depot.obtain::<Config>();
```
