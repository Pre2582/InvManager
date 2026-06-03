#!/bin/sh
# 1. Wait for DB
# 2. If tables exist but no alembic_version: stamp head (DB was pre-created by create_all)
# 3. Otherwise: run alembic upgrade head
# 4. Start uvicorn

set -e

echo "==> Checking database connectivity..."

MAX_RETRIES=20
RETRY_INTERVAL=3
attempt=1

until python - <<'EOF'
import asyncio, asyncpg, os, sys

async def check():
    raw = os.environ.get("DATABASE_URL", "")
    url = (raw
           .replace("postgresql+asyncpg://", "postgresql://")
           .replace("postgres://", "postgresql://"))
    try:
        conn = await asyncpg.connect(url, timeout=5)
        await conn.close()
    except Exception as e:
        print(f"    DB not ready: {e}")
        sys.exit(1)

asyncio.run(check())
EOF
do
    if [ "$attempt" -ge "$MAX_RETRIES" ]; then
        echo "ERROR: database did not become ready after $MAX_RETRIES attempts. Exiting."
        exit 1
    fi
    echo "    Attempt $attempt/$MAX_RETRIES — retrying in ${RETRY_INTERVAL}s..."
    attempt=$((attempt + 1))
    sleep "$RETRY_INTERVAL"
done

echo "==> Database is ready."

echo "==> Checking migration state..."
MIGRATION_ACTION=$(python - <<'EOF'
import asyncio, asyncpg, os, sys

async def check():
    raw = os.environ.get("DATABASE_URL", "")
    url = (raw
           .replace("postgresql+asyncpg://", "postgresql://")
           .replace("postgres://", "postgresql://"))
    conn = await asyncpg.connect(url, timeout=5)

    tables_exist = await conn.fetchval(
        "SELECT COUNT(*) FROM information_schema.tables "
        "WHERE table_schema='public' AND table_name='users'"
    )
    alembic_exists = await conn.fetchval(
        "SELECT COUNT(*) FROM information_schema.tables "
        "WHERE table_schema='public' AND table_name='alembic_version'"
    )
    await conn.close()

    # Tables exist but no Alembic history = DB was bootstrapped by SQLAlchemy create_all
    if tables_exist > 0 and alembic_exists == 0:
        print("stamp")
    else:
        print("migrate")

asyncio.run(check())
EOF
)

if [ "$MIGRATION_ACTION" = "stamp" ]; then
    echo "==> DB already initialised (no migration history). Stamping Alembic at head..."
    alembic stamp head
    echo "==> Stamp complete."
else
    echo "==> Running Alembic migrations..."
    alembic upgrade head
    echo "==> Migrations complete."
fi

echo "==> Starting Uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --workers 2 \
    --log-level info
