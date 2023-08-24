# Rate Limiter

提供流量控制功能的中间件.


## 主要功能

* `RateIssuer` 提供了对分配的识别访问者身份键值的抽象. `RemoteIpIssuer` 是它的一个实现, 可以依据请求的 IP 地址确定访问者. 键不一定是字符串类型, 任何满足 `Hash + Eq + Send + Sync + 'static` 约束的类型都可以作为键.

* `RateGuard` 提供对流量控制算法的抽象. 默认实现了固定窗口(`FixedGuard`)和滑动窗口(`SlidingGuard`)两个实现方式.

* `RateStore` 提供对数据的存取操作. `MokaStore` 是内置的基于 `moka` 的一个内存的缓存实现. 你也可以定义自己的实现方式.

* `RateLimiter` 是实现了 `Handler` 的结构体, 内部还有一个 `skipper` 字段, 可以指定跳过某些不需要缓存的请求. 默认情况下, 会使用 `none_skipper` 不跳过任何请求.

* `QuotaGetter` 提供配额获取的抽象, 可根据访问者的 `Key` 获取一个配额对象, 也就意味着我们可以把用户配额等信息配置到数据库中,动态改变, 动态获取.

_**示例代码**_ 

### 静态配额示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-static/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-static/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### 动态配额示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-dynamic/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-dynamic/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>