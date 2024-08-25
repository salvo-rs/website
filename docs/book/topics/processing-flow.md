# Processing Flow

`Service` first converts the request into salvo's `Response`, and then enters the route matching stage.

## Route matching phase

Route matching runs filters in the order of addition, from outside to inside and from top to bottom. If any filter fails to execute, it will be considered a match failure.

During the matching process, there is path information to be given to the request. As the matching proceeds, once the path filter successfully matches, it will consume the path it matches. When all paths are consumed and no filter fails to match on the matching link, the last `Router` on the current link has a `goal` `Handler`, then the match is successful, the matching phase ends, and the `Handler` on all matching links is collected and matched to enter the execution phase.

If the path is not consumed, the filter on the link does not report an error, but there are no more sub-routes to continue matching, then the current link is considered to have failed to match, and the next route matching will be entered.

If all routes are matched and there is no success, then the error capture phase will be entered.

## Handler execution phase

Execute `Handler` in sequence according to the `Handler` list collected in the matching phase. During the execution process, the previous middleware can call `ctrl::call_next()` Let the subsequent middleware execute first, and then execute your own logic. If there is a status code error or redirection during the execution, the subsequent `Handler` will no longer be executed. At this time, if the status code is an error, and the `Body` of the `Response` is not set or is `ResBody::Error`, it will enter the error capture phase, otherwise it will skip the capture phase.

# Error capture phase

`Catcher` is a type used to handle errors. It can also add middleware (hoops). The error will pass through all `Handler` in `Catcher` in turn. If a `Handler` has handled the error and you don't want the subsequent `Handler` to continue executing, you can skip the subsequent `Handler` through `ctrl.skip_rest()` and end the capture phase directly.

`Catcher` must contain a `Handler` by default for default error handling. The default is `DeaultGoal`, and you can also completely customize your own `Handler` as the default implementation of error handling. It will be based on the `content-type` required by the request header Displays error messages in the corresponding format, supporting four display formats: `json`, `xml`, `text`, and `html`. `DeaultGoal` also provides some display settings. For example, by default it will display salvo related links when displaying html format. You can call `DefaultGoal::footer` or `DefaultGoal::with_footer` to set it to your desired custom footer.

`Service` will convert salvo's `Response` to hyper's `Response` type, and finally return it to the browser and other clients.