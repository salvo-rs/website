# Rate Limiter

Middleware that provides flow control functionality.


## Main Features

* `RateIssuer` provides an abstraction of the assigned key value to identify the visitor's identity. `RemoteIpIssuer` is an implementation of it that can determine the visitor based on the requested IP address. Eq + Send + Sync + 'static` constraint types can be used as keys.

* `RateGuard` provides an abstraction for the flow control algorithm. By default, two implementations of fixed window (`FixedGuard`) and sliding window (`SlidingGuard`) are implemented.

* `RateStore` provides access to data. `MemoryStore` is a built-in `moka`-based memory cache implementation. You can also define your own implementation.

* `RateLimiter` is a structure that implements `Handler`, and there is also a `skipper` field inside, which can be specified to skip certain requests that do not require caching. By default, `none_skipper` will be used to not skip any requests.

* `QuotaGetter` provides the abstraction of quota acquisition, which can obtain a quota object according to the visitor's `Key`, which means that we can configure the user quota and other information into the database, change it dynamically, and acquire it dynamically.

_**Example**_ 

### Use static quota

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/rate-limiter-static/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/rate-limiter-static/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### Use dynamic quota

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/rate-limiter-dynamic/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../codes/rate-limiter-dynamic/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>