# Rate Limiter

提供流量控制功能的中間件.


## 主要功能

* `RateIssuer` 提供了對分配的識別訪問者身份鍵值的抽象. `RemoteIpIssuer` 是它的一個實現, 可以依據請求的 IP 地址確定訪問者. 鍵不一定是字符串類型, 任何滿足 `Hash + Eq + Send + Sync + 'static` 約束的類型都可以作爲鍵.

* `RateGuard` 提供對流量控制算法的抽象. 默認實現了固定窗口(`FixedGuard`)和滑動窗口(`SlidingGuard`)兩個實現方式.

* `RateStore` 提供對數據的存取操作. `MemoryStore` 是內置的基於 `moka` 的一個內存的緩存實現. 你也可以定義自己的實現方式.

* `RateLimiter` 是實現了 `Handler` 的結構體, 內部還有一個 `skipper` 字段, 可以指定跳過某些不需要緩存的請求. 默認情況下, 會使用 `none_skipper` 不跳過任何請求.

* `QuotaGetter` 提供配額獲取的抽象, 可根據訪問者的 `Key` 獲取一個配額對象, 也就意味着我們可以把用戶配額等信息配置到數據庫中,動態改變, 動態獲取.

_**示例代碼**_ 

### 靜態配額示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-static/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-static/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>


### 動態配額示例

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/rate-limiter-dynamic/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/rate-limiter-dynamic/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>