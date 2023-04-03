# Catcher

If the status code of `Response` returned by the request is an error, and the `Body` in the page is empty, then salvo will try to use `Catcher` to catch the error and display a friendly error page.


A simple way to create a custom `Catcher` is to return a system default `Catcher` via `Catcher::default()`, and then add it to `Service`.

```rust
use salvo::catcher::Catcher;

Service::new(router).with_catcher(Catcher::default());
```

The default ```Catcher``` supports sending error pages in ```XML```, ```JSON```, ```HTML```, ```Text``` formats.

You can add a custom error catcher to `Catcher` by adding `hoop` to the default `Catcher`. The error catcher is still `Handler`.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>