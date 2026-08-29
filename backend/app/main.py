from __future__ import annotations

from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import CORS_ORIGINS, DATABASE_PATH
from .database import export_state, init_db, session, upsert_collection
from .security import issue_token, read_token, verify_password


app = FastAPI(title="PARMITALIA Central API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class CollectionPayload(BaseModel):
    data: Any


@app.on_event("startup")
def startup() -> None:
    init_db()


def current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    payload = read_token(authorization.split(" ", 1)[1].strip())
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"ok": True, "database": str(DATABASE_PATH)}


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict[str, str]:
    with session() as conn:
        row = conn.execute(
            "SELECT username, password_hash, role, active FROM users WHERE username = ?",
            (request.username,),
        ).fetchone()
    if not row or not row["active"] or not verify_password(request.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = issue_token({"sub": row["username"], "role": row["role"]})
    return {"access_token": token, "token_type": "bearer", "role": row["role"]}


@app.get("/api/state")
def get_state(_user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    return export_state()


@app.get("/api/state/{collection_name}")
def get_collection(collection_name: str, _user: dict[str, Any] = Depends(current_user)) -> dict[str, Any]:
    with session() as conn:
        row = conn.execute("SELECT payload_json FROM collections WHERE name = ?", (collection_name,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Collection not found")
    import json

    return {"name": collection_name, "data": json.loads(row["payload_json"])}


@app.put("/api/state/{collection_name}")
def put_collection(
    collection_name: str,
    payload: CollectionPayload,
    user: dict[str, Any] = Depends(current_user),
) -> dict[str, Any]:
    if user.get("role") not in {"admin", "management"}:
        raise HTTPException(status_code=403, detail="Role cannot modify data")
    with session() as conn:
        upsert_collection(conn, collection_name, payload.data)
    return {"ok": True, "name": collection_name}
