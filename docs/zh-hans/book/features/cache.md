# Cache

提供缓存功能的中间件.

Cache 中间件可以对 `Response` 中的 `StatusCode`, `Headers`, `Body` 提供缓存功能. 对于已经缓存的内容, 当下次处理请求时, Cache 中间件会直接把缓存在内存中的内容发送给客户端.

注意, 此插件不会缓存 `Body` 是 `ResBody::Stream` 的 `Response`. 如果应用到了这一类型的 `Response`, Cache 不会处理这些请求, 也不会引起错误.

## 主要功能

* `CacheIssuer` 提供了对分配的缓存键值的抽象. `RequestIssuer` 是它的一个实现, 可以定义依据请求的 URL 的哪些部分以及请求的 `Method` 生成缓存的键. 你也可以定义你自己的缓存键生成的逻辑. 缓存的键不一定是字符串类型, 任何满足 `Hash + Eq + Send + Sync + 'static` 约束的类型都可以作为键.

* `CacheStore` 提供对数据的存取操作. `MokaStore` 是内置的基于 `moka` 的一个内存的缓存实现. 你也可以定义自己的实现方式.

* `Cache` 是实现了 `Handler` 的结构体, 内部还有一个 `skipper` 字段, 可以指定跳过某些不需要缓存的请求. 默认情况下, 会使用 `MethodSkipper` 跳过除了 `Method::GET` 以外的所有请求.
  
  内部实现示例代码:
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

_**示例代码**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cache-simple/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cache-simple/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>