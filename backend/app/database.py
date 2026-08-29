from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

from .config import ADMIN_PASSWORD, ADMIN_USER, DATABASE_PATH
from .security import hash_password


def connect(path: Path | None = None) -> sqlite3.Connection:
    db_path = path or DATABASE_PATH
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    return conn


@contextmanager
def session(path: Path | None = None) -> Iterator[sqlite3.Connection]:
    conn = connect(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(path: Path | None = None) -> None:
    with session(path) as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT NOT NULL UNIQUE,
              password_hash TEXT NOT NULL,
              role TEXT NOT NULL DEFAULT 'admin',
              active INTEGER NOT NULL DEFAULT 1,
              created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS collections (
              name TEXT PRIMARY KEY,
              payload_json TEXT NOT NULL,
              item_count INTEGER,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS metadata (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        existing = conn.execute("SELECT id FROM users WHERE username = ?", (ADMIN_USER,)).fetchone()
        if not existing:
            conn.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
                (ADMIN_USER, hash_password(ADMIN_PASSWORD), "admin"),
            )


def upsert_collection(conn: sqlite3.Connection, name: str, value: Any) -> None:
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    item_count = len(value) if isinstance(value, list) else None
    conn.execute(
        """
        INSERT INTO collections (name, payload_json, item_count, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET
          payload_json = excluded.payload_json,
          item_count = excluded.item_count,
          updated_at = CURRENT_TIMESTAMP
        """,
        (name, payload, item_count),
    )


def set_metadata(conn: sqlite3.Connection, key: str, value: Any) -> None:
    conn.execute(
        """
        INSERT INTO metadata (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        """,
        (key, json.dumps(value, ensure_ascii=False, separators=(",", ":"))),
    )


def import_state(state: dict[str, Any], path: Path | None = None, source: str = "unknown") -> dict[str, Any]:
    init_db(path)
    with session(path) as conn:
        for key, value in state.items():
            upsert_collection(conn, key, value)
        set_metadata(conn, "last_import", {"source": source, "top_level_keys": len(state)})
        rows = conn.execute(
            "SELECT name, item_count FROM collections WHERE item_count IS NOT NULL ORDER BY name"
        ).fetchall()
    return {"collections": len(state), "arrays": {row["name"]: row["item_count"] for row in rows}}


def export_state(path: Path | None = None) -> dict[str, Any]:
    init_db(path)
    with session(path) as conn:
        rows = conn.execute("SELECT name, payload_json FROM collections ORDER BY name").fetchall()
    return {row["name"]: json.loads(row["payload_json"]) for row in rows}
