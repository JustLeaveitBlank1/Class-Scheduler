# backend/app/scripts/check_schema.py
from __future__ import annotations
import sys, pathlib, os
from sqlalchemy import create_engine, inspect, text

# --- Make sure 'app' is importable no matter where we run from ---
HERE = pathlib.Path(__file__).resolve()
BACKEND_ROOT = HERE.parents[2]           # .../backend
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Try to import settings; fall back to env var if needed
try:
    from app.core.config import settings
    db_url = settings.SQLALCHEMY_DATABASE_URI
except Exception:
    db_url = os.getenv("SQLALCHEMY_DATABASE_URI") or os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError(
            "Could not import app.core.config.settings and no SQLALCHEMY_DATABASE_URI/DATABASE_URL env var found."
        )

engine = create_engine(db_url, future=True)
insp = inspect(engine)

print("sections:", [c["name"] for c in insp.get_columns("sections")])
print("instructors:", [c["name"] for c in insp.get_columns("instructors")])

with engine.connect() as conn:
    uc = conn.execute(text("""
        SELECT conname, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conname = 'uq_course_section_number'
    """)).fetchall()
    print("UC:", uc)

    enum_vals = conn.execute(text("""
        SELECT e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'section_status'
        ORDER BY e.enumsortorder
    """)).fetchall()
    print("enum:", enum_vals)
