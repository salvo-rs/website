# Catcher

If the status code of `Response` is an error, and the `Body` of `Response` is empty, then salvo will try to use `Catcher` to catch the error and display a friendly error page.

A simple way to create a custom `Catcher` is to return a system default `Catcher` via `Catcher::default()`, and then add it to `Service`.

```rust
use salvo::catcher::Catcher;

Service::new(router).with_catcher(Catcher::default());
```

The default `Catcher` supports sending error pages in `XML`, `JSON`, `HTML`, `Text` formats.

You can add a custom error handler to `Catcher` by adding `hoop` to the default `Catcher`. The error handler is still `Handler`.

You can add multiple custom error catching handlers to `Catcher` through `hoop`. The custom error handler can call the `FlowCtrl::skip_next` method after handling the error to skip next error handlers and return early.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
