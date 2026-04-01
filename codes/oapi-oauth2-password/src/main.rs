use jsonwebtoken::{EncodingKey, Header};
use salvo::jwt_auth::{ConstDecoder, HeaderFinder};
use salvo::oapi::extract::*;
use salvo::oapi::security::{Flow, OAuth2, Password, Scopes};
use salvo::oapi::swagger_ui::oauth;
use salvo::oapi::{SecurityRequirement, SecurityScheme};
use salvo::prelude::*;
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};

const SECRET_KEY: &[u8] = b"salvo-oauth2-password-demo";
const PROFILE_SCOPE: &str = "profile";
const SECURITY_SCHEME_NAME: &str = "oauth2_password";

#[derive(Clone, Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
struct PasswordGrantForm {
    grant_type: Option<String>,
    username: String,
    password: String,
    scope: Option<String>,
    client_id: Option<String>,
    client_secret: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: i64,
}

#[derive(Debug, Serialize, Deserialize, ToSchema)]
struct UserProfile {
    username: String,
    scope: String,
}

#[endpoint]
async fn issue_token(form: FormBody<PasswordGrantForm>) -> Result<Json<TokenResponse>, StatusError> {
    let form = form.into_inner();
    if form.grant_type.as_deref().is_some_and(|grant_type| grant_type != "password") {
        return Err(StatusError::bad_request());
    }
    if form.username != "root" || form.password != "pwd" {
        return Err(StatusError::unauthorized());
    }

    let expires_in = Duration::hours(1);
    let claims = Claims {
        sub: form.username,
        exp: (OffsetDateTime::now_utc() + expires_in).unix_timestamp(),
    };
    let access_token = jsonwebtoken::encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(SECRET_KEY),
    )
    .map_err(|_| StatusError::internal_server_error())?;

    Ok(Json(TokenResponse {
        access_token,
        token_type: "Bearer".into(),
        expires_in: expires_in.whole_seconds(),
    }))
}

#[endpoint]
async fn profile(depot: &mut Depot) -> Result<Json<UserProfile>, StatusError> {
    let claims = depot
        .jwt_auth_data::<Claims>()
        .ok_or_else(StatusError::unauthorized)?;

    Ok(Json(UserProfile {
        username: claims.claims.sub.clone(),
        scope: PROFILE_SCOPE.into(),
    }))
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();

    let auth: JwtAuth<Claims, _> = JwtAuth::new(ConstDecoder::from_secret(SECRET_KEY))
        .finders(vec![Box::new(HeaderFinder::new())])
        .force_passed(true);

    let api = Router::with_path("api")
        .hoop(auth)
        // Middleware protects the route, but the OpenAPI security requirement
        // still needs to be declared explicitly for documentation.
        .oapi_security(SecurityRequirement::new(
            SECURITY_SCHEME_NAME,
            [PROFILE_SCOPE],
        ))
        .push(Router::with_path("profile").get(profile));

    let router = Router::new()
        .push(Router::with_path("oauth/token").post(issue_token))
        .push(api);

    let doc = OpenApi::new("OAuth2 Password Demo", "0.0.1")
        .add_security_scheme(
            SECURITY_SCHEME_NAME,
            SecurityScheme::OAuth2(OAuth2::new([Flow::Password(Password::new(
                "/oauth/token",
                Scopes::from_iter([(PROFILE_SCOPE, "Read the current user's profile")]),
            ))])),
        )
        .merge_router(&router);

    let router = router
        .unshift(doc.into_router("/api-doc/openapi.json"))
        .unshift(
            SwaggerUi::new("/api-doc/openapi.json")
                .oauth(
                    oauth::Config::new()
                        .client_id("swagger-ui")
                        .scopes(vec![PROFILE_SCOPE.into()]),
                )
                .into_router("/swagger-ui"),
        );

    let acceptor = TcpListener::new("0.0.0.0:8698").bind().await;
    Server::new(acceptor).serve(router).await;
}
