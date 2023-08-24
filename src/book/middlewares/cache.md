# Cache

Middleware that provides caching functionality.

Cache middleware can provide caching function for `StatusCode`, `Headers`, `Body` in `Response`. For the content that has been cached, when processing the request next time, Cache middleware will directly send the content cached in memory to the client.

Note that this plugin will not cache `Response` whose `Body` is a `ResBody::Stream`. If applied to a `Response` of this type, the Cache will not process these requests and will not cause error.

## Main Features

* `CacheIssuer` provides an abstraction over the assigned cache keys. `RequestIssuer` is an implementation of it that defines which parts of the requested URL and the requested `Method` to generate a cache key. You can also define your own The logic of cache key generation. The cache key does not have to be a string type, any type that satisfies the constraints of `Hash + Eq + Send + Sync + 'static` can be used as a key.
  
* `CacheStore` provides access to data. `MokaStore` is a built-in `moka`-based memory cache implementation. You can also define your own implementation.
  
* `Cache` is a structure that implements `Handler`, and there is a `skipper` field inside, which can be specified to skip certain requests that do not need to be cached. By default, `MethodSkipper` will be used to skip all request except `Method::GET`.
  
  Internal implementation sample code:

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

_**Example**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/cache-simple/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/cache-simple/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>