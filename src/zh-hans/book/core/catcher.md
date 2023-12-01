# Catcher

如果请求返回的 `Response` 的状态码是错误, 而页面里面的 `Body` 是空, 这时 salvo 会试图使用 `Catcher` 捕获这个错误, 显示一个友好的错误页面.


一种简单的创建自定义 `Catcher` 的方法是通过 `Catcher::default()` 返回一个系统默认的 `Catcher`, 然后讲它添加到 `Service` 上.

```rust
use salvo::catcher::Catcher;

Service::new(router).with_catcher(Catcher::default());
```

默认的 ```Catcher``` 支持以 ```XML```, ```JSON```, ```HTML```, ```Text``` 格式发送错误页面.

可以通过给这个默认的 `Catcher` 添加 `hoop` 的方式, 把自定义的错误捕获程序添加到`Catcher`上. 这个错误捕获的程序依然是 `Handler`.

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>