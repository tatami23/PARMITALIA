from __future__ import annotations

import argparse
import json
import os
from pathlib import Path


def default_state_path() -> Path:
    appdata = os.environ.get("APPDATA")
    if appdata:
        return Path(appdata) / "parmitalia-management-desktop" / "parmitalia-state.json"
    return Path.home() / "AppData" / "Roaming" / "parmitalia-management-desktop" / "parmitalia-state.json"


def summarize(state: dict) -> dict:
    arrays = {key: len(value) for key, value in state.items() if isinstance(value, list)}
    important = {
        key: arrays.get(key, 0)
        for key in [
            "products",
            "contacts",
            "orders",
            "offers",
            "documents",
            "employees",
            "users",
            "tenders",
            "crmActivities",
            "incomingInvoices",
            "outgoingInvoices",
        ]
    }
    return {
        "top_level_keys": len(state),
        "important_counts": important,
        "array_collections": arrays,
        "autosave": state.get("_pmsAutosave", {}),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Export PARMITALIA local desktop data to a central-import seed file.")
    parser.add_argument("--source", type=Path, default=default_state_path())
    parser.add_argument("--out", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "seed" / "parmitalia-state-export.json")
    args = parser.parse_args()

    state = json.loads(args.source.read_text(encoding="utf-8"))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    manifest = args.out.with_suffix(".manifest.json")
    manifest.write_text(json.dumps(summarize(state), ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"exported": str(args.out), "manifest": str(manifest), **summarize(state)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
