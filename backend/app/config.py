from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]


def env(name: str, default: str) -> str:
    return os.environ.get(name, default).strip() or default


DATABASE_PATH = Path(env("PARMITALIA_DATABASE_PATH", str(BASE_DIR / "data" / "parmitalia-central.sqlite3")))
SECRET_KEY = env("PARMITALIA_SECRET_KEY", "change-this-before-real-employee-access")
ADMIN_USER = env("PARMITALIA_ADMIN_USER", "admin")
ADMIN_PASSWORD = env("PARMITALIA_ADMIN_PASSWORD", "change-me-before-use")
CORS_ORIGINS = [
    item.strip()
    for item in env("PARMITALIA_CORS_ORIGINS", "http://127.0.0.1:8000,http://localhost:8000").split(",")
    if item.strip()
]
