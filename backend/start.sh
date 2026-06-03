#!/bin/sh
# ─── Backend startup script ───────────────────────────────────────────────────
# 1. Wait for the PostgreSQL database to be reachable
# 2. Run Alembic migrations
# 3. Start the Uvicorn server
#
# Railway restarts the container on non-zero exit (ON_FAILURE policy),
# so this script just exits 1 when the DB is unreachable after all retries.

set -e

echo "==> Checking database connectivity..."

MAX_RETRIES=20
RETRY_INTERVAL=3
attempt=1

until python - <<'EOF'
import asyncio, asyncpg, os, sys

async def check():
    raw = os.environ.get("DATABASE_URL", "")
    # normalise to asyncpg-compatible URL
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

echo "==> Running Alembic migrations..."
alembic upgrade head
echo "==> Migrations complete."

echo "==> Starting Uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --workers 2 \
    --log-level info
