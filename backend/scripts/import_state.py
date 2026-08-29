from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import import_state  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="Import a PARMITALIA state JSON file into the central database.")
    parser.add_argument("state_json", type=Path)
    parser.add_argument("--database", type=Path, default=None)
    args = parser.parse_args()

    state = json.loads(args.state_json.read_text(encoding="utf-8"))
    result = import_state(state, path=args.database, source=str(args.state_json))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
