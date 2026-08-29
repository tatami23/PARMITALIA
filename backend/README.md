# PARMITALIA Central Backend

This folder is the first safe step toward one private PARMITALIA link for employees.

The existing secured desktop app remains usable. This backend is separate and stores imported PARMITALIA business data in a central database file for local testing. Later, the same API shape can be moved to PostgreSQL on a private server.

## Current Scope

- Export the existing local desktop business data.
- Import it into a central database.
- Provide authenticated API endpoints for the future browser app.
- Keep source code and business data separated.

## Data Source

Current desktop data is expected at:

```text
C:\Users\Lenovo i3\AppData\Roaming\parmitalia-management-desktop\parmitalia-state.json
```

That file contains customers, products, orders, CRM, employees, documents, tenders, and other PARMITALIA records.

## Local Test Steps

From this `backend` folder:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe .\scripts\export_local_state.py
.\.venv\Scripts\python.exe .\scripts\import_state.py .\data\seed\parmitalia-state-export.json
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Then the local API is available at:

```text
http://127.0.0.1:8000/api/health
```

If this PC cannot install FastAPI yet, use the built-in private test server:

```powershell
.\.venv\Scripts\python.exe .\scripts\run_private_api_stdlib.py
```

From the main PARMITALIA app folder, the easiest option is now:

```powershell
.\START_PRIVATE_API.cmd
```

You can also double-click `START_PRIVATE_API.cmd`.

If the database is missing, this starter recreates it automatically from the local PARMITALIA data file.

It exposes:

```text
http://127.0.0.1:8000/api/health
http://127.0.0.1:8000/api/summary
http://127.0.0.1:8000/api/state/products
```

## Before Real Employee Access

- Change `PARMITALIA_SECRET_KEY`.
- Change `PARMITALIA_ADMIN_PASSWORD`.
- Move from local SQLite to PostgreSQL/MySQL on a secured server.
- Add HTTPS and a private domain.
- Replace the front-end localStorage writes with API calls.
- Verify imported records against the old desktop system before users log in.
