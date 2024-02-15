# Introducción

Salvo es un marco de backend web Rust extremadamente simple y poderoso. Sólo se requieren conocimientos básicos de Rust para desarrollar servicios backend.

- Construido con [Hyper](https://crates.io/crates/hyper) y [Tokio](https://crates.io/crates/tokio);
- Http1, Http2 y **Http3**;
- Middleware unificado e interfaz de manejo;
- Enrutadores ilimitados de manera anidada;
- Cada enrutador puede tener uno o varios middlewares;
- Procesamiento de formularios multipart integrado;
- Soporte a WebSocket;
- soporte a Acme, obtiene certificado TLS automáticamente desde [let's encrypt](https://letsencrypt.org/).
