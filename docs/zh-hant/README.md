---
home: true
title: Home
heroImage: /images/logo-text.svg
heroText: null
actions:
  - text: 快速開始
    link: /zh-hans/book/guide.html
    type: primary
  - text: 捐獻金子
    link: /zh-hans/donate.html
    type: secondary
features:
  - title: 簡單得讓你一見鍾情
    details: 你並不需要掌握非常複雜的 Rust 語言功能, 僅僅只需要裏面的常見的功能, 就可以寫出強大高效的服務器, 媲美 Go 類的 Web 服務器框架的開發速度.
  - title: 強大實用的功能
    details: 雖然簡單, 但是功能依舊強大, 內置 Multipart, OpenAPI, 靈活的數據解析...等等, 能滿足大多數業務場景需求.
  - title: 風馳電掣的性能
    details: 在 Rust 的加持下, 性能爆表. 與其他大多數語言的框架對比, 就像是他們拿着大炮, 你直接就出了核武器.
  - title: 從未見過的路由系統
    details: Salvo 擁有與衆不同的路由系統, 可以無限嵌套, 使用方便, 靈活, 高效. 你可以用各種姿勢隨心所欲地使用它, 它能帶給你前所未有的極致快感. 
  - title: 極簡的中間件系統
    details: Salvo 中中間件和處理句柄都是 Handler, 兩者合體, 和諧統一, 一片祥和. 官方提供豐富且靈活的中間件實現.
  - title: 運行穩定無憂
    details: Rust 極其安全的機制, 讓你的網站上線後, 基本沒有後顧之憂. 你有更多的時間和...在...啪啪啪享受性福時光, 而不是在焦頭爛額地啪啪啪地敲着鍵盤搶救你的服務器程序.
footer: MIT Licensed | Copyright © 2019-present Salvo Team
---

### Hello world!

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
  
@[code rust](../../codes/hello/src/main.rs)

  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
  
@[code toml](../../codes/hello/Cargo.toml)

  </CodeGroupItem>
</CodeGroup>
