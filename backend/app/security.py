from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from .config import SECRET_KEY


TOKEN_TTL_SECONDS = 8 * 60 * 60
PBKDF2_ITERATIONS = 210_000


def hash_password(password: str, salt: str | None = None) -> str:
    salt_bytes = base64.urlsafe_b64decode(salt.encode("ascii")) if salt else secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.urlsafe_b64encode(salt_bytes).decode("ascii"),
        base64.urlsafe_b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, iterations, salt, digest = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        check = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), base64.urlsafe_b64decode(salt), int(iterations))
        return hmac.compare_digest(base64.urlsafe_b64encode(check).decode("ascii"), digest)
    except Exception:
        return False


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _unb64(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


def issue_token(payload: dict[str, Any]) -> str:
    body = dict(payload)
    body["exp"] = int(time.time()) + TOKEN_TTL_SECONDS
    body_raw = json.dumps(body, separators=(",", ":"), sort_keys=True).encode("utf-8")
    body_b64 = _b64(body_raw)
    sig = hmac.new(SECRET_KEY.encode("utf-8"), body_b64.encode("ascii"), hashlib.sha256).digest()
    return body_b64 + "." + _b64(sig)


def read_token(token: str) -> dict[str, Any] | None:
    try:
        body_b64, sig_b64 = token.split(".", 1)
        expected = hmac.new(SECRET_KEY.encode("utf-8"), body_b64.encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64(expected), sig_b64):
            return None
        payload = json.loads(_unb64(body_b64).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            return None
        return payload
    except Exception:
        return None
