# Catcher

```Catcher``` is used to handle how to display page when response's code is error.

```rust
pub trait Catcher: Send + Sync + 'static {
    fn catch(&self, req: &Request, res: &mut Response) -> bool;
}
```

A web application can specify several different Catchers to handle errors. They are stored in the Service field:

```rust
pub struct Service {
    pub(crate) router: Arc<Router>,
    pub(crate) catchers: Arc<Vec<Box<dyn Catcher>>>,
    pub(crate) allowed_media_types: Arc<Vec<Mime>>,
}
```

They can be set via the ```with_catchers``` function of ```Server```:

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
@[code rust](../../codes/custom-error-page/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
@[code toml](../../codes/custom-error-page/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>

When there is an error in the website request result, first try to set the error page through the ```Catcher``` set by the user. If the ```Catcher``` catches the error, it will return ```true```. 

If your custom catchers does not capture this error, then the system uses the default ```CatcherImpl``` to capture processing errors and send the default error page. The default error implementation ```CatcherImpl``` supports sending error pages in ```XML```, ```JSON```, ```HTML```, ```Text``` formats.