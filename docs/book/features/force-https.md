# Force HTTPS

`force-https` middleware can force all requests to use the HTTPS protocol.

If this middleware is applied to `Router`, the protocol will be forced to convert only when the route is matched. If the page does not exist, it will not be redirected.

But a more common requirement is to expect any request to be automatically redirected, even when the route fails to match and returns a `404` error. At this time, you can add the middleware to `Service`. Regardless of whether the request is successfully matched by the route, the middleware added to `Service` will always be executed.

_**Sample code**_

<CodeGroup>
<CodeGroupItem title="main.rs" active>

@[code rust](../../../codes/force-https/src/main.rs)

</CodeGroupItem>
<CodeGroupItem title="Cargo.toml">

@[code rust](../../../codes/force-https/Cargo.toml)

</CodeGroupItem> </CodeGroup>