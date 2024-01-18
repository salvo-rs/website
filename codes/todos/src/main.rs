use once_cell::sync::Lazy;

use salvo::prelude::*;
use salvo::size_limiter;

use self::models::*;

static STORE: Lazy<Db> = Lazy::new(new_store);

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().init();
    start_server().await;
}

pub(crate) async fn start_server() {
    let router = Router::with_path("todos")
        .hoop(size_limiter::max_size(1024 * 16))
        .get(list_todos)
        .post(create_todo)
        .push(
            Router::with_path("<id>")
                .put(update_todo)
                .delete(delete_todo),
        );

    let acceptor = TcpListener::new("127.0.0.1:5800").bind().await;
    Server::new(acceptor).serve(router).await;
}

#[handler]
pub async fn list_todos(req: &mut Request, res: &mut Response) {
    let opts = req.parse_body::<ListOptions>().await.unwrap_or_default();
    let todos = STORE.lock().await;
    let todos: Vec<Todo> = todos
        .clone()
        .into_iter()
        .skip(opts.offset.unwrap_or(0))
        .take(opts.limit.unwrap_or(std::usize::MAX))
        .collect();
    res.render(Json(todos));
}

#[handler]
pub async fn create_todo(req: &mut Request, res: &mut Response) {
    let new_todo = req.parse_body::<Todo>().await.unwrap();
    tracing::debug!(todo = ?new_todo, "create todo");

    let mut vec = STORE.lock().await;

    for todo in vec.iter() {
        if todo.id == new_todo.id {
            tracing::debug!(id = ?new_todo.id, "todo already exists");
            res.status_code(StatusCode::BAD_REQUEST);
            return;
        }
    }

    vec.push(new_todo);
    res.status_code(StatusCode::CREATED);
}

#[handler]
pub async fn update_todo(req: &mut Request, res: &mut Response) {
    let id = req.param::<u64>("id").unwrap();
    let updated_todo = req.parse_body::<Todo>().await.unwrap();
    tracing::debug!(todo = ?updated_todo, id = ?id, "update todo");
    let mut vec = STORE.lock().await;

    for todo in vec.iter_mut() {
        if todo.id == id {
            *todo = updated_todo;
            res.status_code(StatusCode::OK);
            return;
        }
    }

    tracing::debug!(id = ?id, "todo is not found");
    res.status_code(StatusCode::NOT_FOUND);
}

#[handler]
pub async fn delete_todo(req: &mut Request, res: &mut Response) {
    let id = req.param::<u64>("id").unwrap();
    tracing::debug!(id = ?id, "delete todo");

    let mut vec = STORE.lock().await;

    let len = vec.len();
    vec.retain(|todo| todo.id != id);

    let deleted = vec.len() != len;
    if deleted {
        res.status_code(StatusCode::NO_CONTENT);
    } else {
        tracing::debug!(id = ?id, "todo is not found");
        res.status_code(StatusCode::NOT_FOUND);
    }
}

mod models {
    use serde::{Deserialize, Serialize};
    use tokio::sync::Mutex;

    pub type Db = Mutex<Vec<Todo>>;

    pub fn new_store() -> Db {
        Mutex::new(Vec::new())
    }

    #[derive(Serialize, Deserialize, Clone, Debug)]
    pub struct Todo {
        pub id: u64,
        pub text: String,
        pub completed: bool,
    }

    #[derive(Deserialize, Debug, Default)]
    pub struct ListOptions {
        pub offset: Option<usize>,
        pub limit: Option<usize>,
    }
}
