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
    details: 其他 Rust 框架是在你掌握複雜的 Rust 語言功能，做完各種類型體操後依然“百思不得騎姐”， 而 Salvo 卻善解人意，不管是新手還是老司機都可以輕鬆“破門而入，生兒育女”。
  - title: 強大實用的功能
    details: 雖然使用簡單, 但是功能依舊強大, 內置 Multipart, OpenAPI，HTTP2/3, LetsEncrypt, 靈活的數據解析...等等實用功能.
  - title: 風馳電掣的性能
    details: 在 Rust 的加持下, 性能爆錶. 與其他大多數語言的框架對比, 就像是他們使著小手槍一槍一槍地打, 你直接就掏出了你的大機關槍持久輸出.
  - title: 從未見過的路由係統
    details: Salvo 擁有與衆不同的路由係統, 可以無限嵌套, 使用方便, 靈活, 高效. 你可以用各種姿勢隨心所欲地使用它, 想套就套，想去哪就去哪，帶給你前所未有的極緻快感. 
  - title: 極簡的中間件係統
    details: Salvo 中中間件和處理句柄都是 Handler, 兩者合二為一, 和諧統一. 並且官方提供豐富且靈活的中間件實現，滿足多種應用場景需求.
  - title: 運行穩定無憂
    details: Rust 的安全機製, 讓你的網站上線後持久不崩, 冇有後顧之憂. 你有更多的時間和你的異（同）性朋友享受啪啪啪地“玩遊戲”時光, 而不是啪啪啪地敲鍵盤搶救伺務器.
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
