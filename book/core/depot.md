# Depot

Depot is used to save data when process current request. It is useful for middlewares to share data.

A depot instance created when server get a request from client. The depot will dropped when all process for this request done.

For example, we can set ```current_user``` in ```set_user```, and then use this value in the following middlewares and handlers.


<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../codes/use-depot/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code rust](../../codes/use-depot/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

## Set and retrieve data via `insert` and `get`

  As shown above, `key` and `value` can be inserted into `Depot` via `insert`. For values of this type, `get` can be used to retrieve them directly.

```rust
depot.insert("a", "b");
assert_eq!(depot.get::<&str>("a").copied().unwrap(), "b")
````

  Returns `None` if the `key` does not exist, or if the `key` exists, but the types do not match.

## Set and retrieve data via `inject` and `obtain`

Sometimes, there are cases where you don't need a relation-specific `key`, and there is also a unique instance of that type. You can use `inject` to inject data, and `obtain` to get data out. They don't require you to provide a `key`.

```rust
depot.inject(Config::new());
depot.obtain::<Config>();
````