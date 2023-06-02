# Cache

提供緩存功能的中間件. 

Cache 中間件可以對 `Response` 中的 `StatusCode`, `Headers`, `Body` 提供緩存功能. 對於已經緩存的內容, 當下次處理請求時, Cache 中間件會直接把緩存在內存中的內容發送給客戶端.

注意, 此插件不會緩存 `Body` 是 `ResBody::Stream` 的 `Response`. 如果應用到了這一類型的 `Response`, Cache 不會處理這些請求, 也不會引起錯誤.

## 主要功能
* `CacheIssuer` 提供了對分配的緩存鍵值的抽象. `RequestIssuer` 是它的一個實現, 可以定義依據請求的 URL 的哪些部分以及請求的 `Method` 生成緩存的鍵. 你也可以定義你自己的緩存鍵生成的邏輯. 緩存的鍵不一定是字符串類型, 任何滿足 `Hash + Eq + Send + Sync + 'static` 約束的類型都可以作爲鍵.

* `CacheStore` 提供對數據的存取操作. `MemoryStore` 是內置的基於 `moka` 的一個內存的緩存實現. 你也可以定義自己的實現方式.

* `Cache` 是實現了 `Handler` 的結構體, 內部還有一個 `skipper` 字段, 可以指定跳過某些不需要緩存的請求. 默認情況下, 會使用 `MethodSkipper` 跳過除了 `Method::GET` 以外的所有請求.
  
  內部實現示例代碼:
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

_**示例代碼**_ 

<CodeGroup>
  <CodeGroupItem title="main.rs" active>

@[code rust](../../../../codes/cache-simple/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">

@[code toml](../../../../codes/cache-simple/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>