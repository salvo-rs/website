---
home: true
title: Home
heroImage: /images/logo-text.svg
heroText: null
actions:
  - text: Get Started
    link: /book/guide.md
    type: primary
  - text: Donate
    link: /donate.md
    type: secondary
features:
  - title: Simplicity First
    details: With only basic knowledge of Rust, you can write a powerful and efficient server comparable to the development speed of some Go web server frameworks.
  - title: Powerful Features
    details: Although it is simple, it is still powerful, with built-in Multipart, extract data from request, etc., which can meet the needs of most business scenarios.
  - title: Performance
    details: Thanks to the performance advantages of Rust, you can write extremely high-performance server-side applications very easily.
  - title: Chainable tree router
    details: Chainable tree routing system let you write routing rules easily and chains. You can use regex to constraint parameters.
  - title: Middlewares
    details: Flexible plugin API, allowing plugins to provide lots of plug-and-play features for your site. 
  - title: Stable after online
    details: Rust's extremely secure mechanism allows you to have no worries after your website is online. You have more time to enjoy your life!
footer: MIT Licensed | Copyright © 2019-present Salvo Team
---

### Hello world!

<CodeGroup>
  <CodeGroupItem title="main.rs" active>
  
@[code rust](./codes/hello/src/main.rs)
  </CodeGroupItem>
  <CodeGroupItem title="Cargo.toml">
  
@[code toml](./codes/hello/Cargo.toml)
  </CodeGroupItem>
</CodeGroup>
