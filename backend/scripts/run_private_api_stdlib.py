from __future__ import annotations

import json
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from os import environ
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "parmitalia-central.sqlite3"
SEED_PATH = ROOT / "data" / "seed" / "parmitalia-state-export.json"
MANIFEST_PATH = ROOT / "data" / "seed" / "parmitalia-state-export.manifest.json"
STATE_PATH = Path(environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "parmitalia-management-desktop" / "parmitalia-state.json"
HOST = "127.0.0.1"
PORT = 8000


def important_counts(state: dict) -> dict:
    wanted = ["products", "contacts", "orders", "offers", "documents", "employees", "users", "tenders"]
    return {key: len(state.get(key, [])) if isinstance(state.get(key), list) else 0 for key in wanted}


def write_seed_files(state: dict) -> None:
    SEED_PATH.parent.mkdir(parents=True, exist_ok=True)
    SEED_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest = {
        "top_level_keys": len(state),
        "important_counts": important_counts(state),
        "autosave": state.get("_pmsAutosave", {}),
        "source": str(STATE_PATH),
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")


def import_state_to_database(state: dict) -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.executescript(
            """
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
        for key, value in state.items():
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
                (key, json.dumps(value, ensure_ascii=False, separators=(",", ":")), item_count),
            )
        conn.execute(
            """
            INSERT INTO metadata (key, value, updated_at)
            VALUES ('last_import', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
            """,
            (json.dumps({"source": str(STATE_PATH), "top_level_keys": len(state)}, ensure_ascii=False),),
        )


def ensure_database() -> None:
    if DB_PATH.exists():
        return
    if not STATE_PATH.exists():
        raise SystemExit(
            "Database not found and local PARMITALIA state file was not found.\n"
            f"Expected database: {DB_PATH}\n"
            f"Expected state file: {STATE_PATH}"
        )
    state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    write_seed_files(state)
    import_state_to_database(state)
    print("Created central database from local PARMITALIA data.")
    print("Imported counts: " + json.dumps(important_counts(state), ensure_ascii=False))


def json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_collection(name: str):
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT payload_json FROM collections WHERE name = ?", (name,)).fetchone()
    return json.loads(row[0]) if row else None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return

    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path == "/api/health":
            with sqlite3.connect(DB_PATH) as conn:
                collections = conn.execute("SELECT COUNT(*) FROM collections").fetchone()[0]
            json_response(self, 200, {"ok": True, "database": str(DB_PATH), "collections": collections})
            return

        if path == "/api/summary":
            wanted = ["products", "contacts", "orders", "offers", "documents", "employees", "users", "tenders"]
            with sqlite3.connect(DB_PATH) as conn:
                rows = dict(conn.execute("SELECT name, item_count FROM collections WHERE name IN ({})".format(",".join("?" for _ in wanted)), wanted))
            json_response(self, 200, {"ok": True, "counts": {key: rows.get(key, 0) for key in wanted}})
            return

        prefix = "/api/state/"
        if path.startswith(prefix):
            name = unquote(path[len(prefix):])
            data = read_collection(name)
            if data is None:
                json_response(self, 404, {"ok": False, "error": "Collection not found"})
            else:
                json_response(self, 200, {"ok": True, "name": name, "data": data})
            return

        json_response(self, 404, {"ok": False, "error": "Not found"})


def main() -> int:
    ensure_database()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"PARMITALIA private test API running on http://{HOST}:{PORT}")
    print("Health:  http://127.0.0.1:8000/api/health")
    print("Summary: http://127.0.0.1:8000/api/summary")
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
