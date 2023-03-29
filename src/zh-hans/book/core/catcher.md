# Catcher

```Catcher``` 是用于处理页面返回 HTTP 状态码为错误的情况下, 如何显示页面的抽象.

```rust
pub trait Catcher: Send + Sync + 'static {
    fn catch(&self, req: &Request, res: &mut Response) -> bool;
}
```

一个网站应用可以指定多个不同的 Catcher 对象处理错误. 它们被保存在 Service 的字段中:

```rust
pub struct Service {
    pub(crate) router: Arc<Router>,
    pub(crate) catchers: Arc<Vec<Box<dyn Catcher>>>,
    pub(crate) allowed_media_types: Arc<Vec<Mime>>,
}
```

可以通过 ```Server``` 的 ```with_catchers``` 函数设置它们:

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/custom-error-page/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/custom-error-page/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>

当网站请求结果有错误时, 首先试图通过用户自己设置的 ```Catcher``` 设置错误页面, 如果 ```Catcher``` 捕获错误, 则返回 ```true```. 

如果您自己设置的 ```Catcher``` 都没有捕获这个错误, 则系统使用默认的 ```Catcher``` 实现 ```CatcherImpl``` 捕获处理错误, 发送默认的错误页面. 默认的错误实现 ```CatcherImpl``` 支持以 ```XML```, ```JSON```, ```HTML```, ```Text``` 格式发送错误页面.