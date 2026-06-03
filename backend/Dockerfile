# ─── Build Stage ─────────────────────────────────────────────────────────────
FROM python:3.12-slim AS base

# System dependencies for asyncpg / psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install Python deps first (layer-cache friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# ─── Production ───────────────────────────────────────────────────────────────
EXPOSE 8000

# start.sh: waits for DB → runs migrations → starts uvicorn
CMD ["./start.sh"]
