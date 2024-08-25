#ID de solicitud

El middleware de ID de solicitud es más flexible. El generador (IdGenerator) se utiliza para generar ID. Puede definir su propio generador de ID siempre que implemente el rasgo `IdGenerator`.

Además, puede controlar si se sobrescribe el `requestid` existente. También puede configurar `header_name`, etc. Para obtener más detalles, [ver el documento](https://docs.rs/salvo_extra/latest/salvo_extra/request_id /index.html) .

_**Código de muestra**_

<Grupo de códigos>
 <CodeGroupItem título="main.rs" activo>

@[código oxidado](../../../../codes/logging/src/main.rs)

 </CodeGroupItem>
 <CodeGroupItem título="Cargo.toml">

@[código toml](../../../../codes/logging/Cargo.toml)

 </CodeGroupItem>
</Grupo de Códigos>