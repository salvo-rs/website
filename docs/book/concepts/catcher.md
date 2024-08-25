# Catcher

If the status code of `Response` is an error, and the `Body` in the page is empty, salvo will try to use `Catcher` to catch the error and display a friendly error page.

You can return a system default `Catcher` through `Catcher::default()`, and then add it to `Service`.

```rust
use salvo::catcher::Catcher;

Service::new(router).catcher(Catcher::default());
```

The default `Catcher` supports sending error pages in `XML`, `JSON`, `HTML`, `Text` formats.

You can add a custom error catcher to `Catcher` by adding `hoop` to the default `Catcher`. This error catcher is still a `Handler`.

You can add multiple custom error catchers to `Catcher` through `hoop`. Custom error handlers can be called after handling errors. `FlowCtrl::skip_next` method skips the subsequent error program and returns early.

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/custom-error-page/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/custom-error-page/Cargo.toml)

</CodeGroupItem>
</CodeGroup>