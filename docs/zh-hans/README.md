---
home: true
title: Home
heroImage: /images/logo-text.svg
heroText: null
actions:
  - text: 快速开始
    link: /zh-hans/book/guide.html
    type: primary
  - text: 捐献金子
    link: /zh-hans/donate.html
    type: secondary
features:
  - title: 简单得让你一见钟情
    details: 其他 Rust 框架是在你掌握复杂的 Rust 语言功能，做完各种类型体操后依然不能正常编译， 而 Salvo 却善解人意，不管是新手还是老司机都可以轻松驾驭.
  - title: 强大实用的功能
    details: 虽然使用简单, 但是功能依旧强大, 内置 Multipart, OpenAPI，HTTP2/3, LetsEncrypt, 灵活的数据解析...等等实用功能.
  - title: 风驰电掣的性能
    details: 在 Rust 的加持下, 性能爆表. 与其他大多数语言的框架对比, 就像是他们使着小手枪一枪一枪地打, 你直接就掏出了你的大机关枪持久输出.
  - title: 从未见过的路由系统
    details: Salvo 拥有与众不同的路由系统, 可以无限嵌套, 使用方便, 灵活, 高效. 你可以用各种姿势随心所欲地使用它, 想套就套，想去哪就去哪，带给你前所未有的极致快感. 
  - title: 极简的中间件系统
    details: Salvo 中中间件和处理句柄都是 Handler, 两者合二为一, 和谐统一. 并且官方提供丰富且灵活的中间件实现，满足多z种应用场景需求.
  - title: 运行稳定无忧
    details: Rust 的安全机制, 让你的网站上线后持久不崩, 没有后顾之忧. 你有更多的时间享受幸福生活, 而不是啪啪啪地敲键盘抢救服务器.
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
