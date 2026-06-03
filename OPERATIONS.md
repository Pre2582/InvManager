# Operations & Setup Guide

Step-by-step reference for setting up, running, and maintaining the InvenTrack system.
Keep this file — it documents every command you will ever need.

---

## Default Login Credentials

| Role  | Username   | Password     | Access Level                        |
|-------|------------|--------------|-------------------------------------|
| Admin | `admin`    | `Admin@1234` | Full access — can change order status |
| User  | `testUser` | `Test1234`   | Standard — place/view orders        |

> **Admin** sees a 🛡️ badge in the sidebar and a status-management panel inside every order detail.

---

## 1. First-Time Local Setup

### Prerequisites
- Python 3.10+ with `pip`
- Node.js 18+ with `npm`
- PostgreSQL 15 running locally

### Step 1 — Clone & enter repo
```bash
cd D:\PREM\Projects\Assesment
```

### Step 2 — Create the database
```sql
-- In psql or pgAdmin:
CREATE DATABASE inventory_db;
```

### Step 3 — Backend setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4 — Configure environment
```bash
# Copy example env file
copy .env.example .env      # Windows
cp .env.example .env        # macOS/Linux

# Edit .env and set your database credentials:
# DATABASE_URL=postgresql+asyncpg://YOUR_USER:YOUR_PASS@localhost:5432/inventory_db
```

### Step 5 — Run all database migrations
```bash
# Must be in backend/ with venv activated
alembic upgrade head
```
This applies ALL migrations in order:
1. `726fd28f8641` — adds `image_url` to products
2. `7d93ea7636fc` — adds `is_admin` to users + `DELIVERED` order status

### Step 6 — Start the backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
On first startup the **seed runs automatically** and creates:
- User `testUser / Test1234`
- Admin `admin / Admin@1234`
- 15 demo products with images

### Step 7 — Frontend setup
```bash
cd ..\frontend        # Windows
cd ../frontend        # macOS/Linux

npm install
npm run dev
```
Frontend runs on **http://localhost:5173** and proxies API calls to `:8000`.

---

## 2. Every Day — Start the App

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

---

## 3. Docker — Full Stack in One Command

```bash
# From repo root (starts DB + Backend + Frontend)
docker compose up --build

# Access:
#   Frontend  → http://localhost
#   API Docs  → http://localhost:8000/docs

# Shut down and remove volumes
docker compose down -v
```

---

## 4. Database Migrations

### Apply all pending migrations
```bash
cd backend && venv\Scripts\activate
alembic upgrade head
```

### Check current migration version
```bash
alembic current
```

### Generate a migration after changing a model
```bash
# 1. Make your change in app/models/
# 2. Generate the migration file:
alembic revision --autogenerate -m "describe what changed"
# 3. Review the generated file in alembic/versions/
# 4. Apply it:
alembic upgrade head
```

### Roll back one migration
```bash
alembic downgrade -1
```

### Migration history
```bash
alembic history --verbose
```

> **Note on PostgreSQL ENUM changes:** Adding new values to an enum (e.g. `DELIVERED`)
> requires raw SQL inside the migration:
> ```python
> op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'DELIVERED'")
> ```
> PostgreSQL does **not** support removing enum values — only adding.

---

## 5. Seed Data

The seed runs automatically on every backend startup (`app/seed.py` is called from `main.py`'s lifespan). It is fully **idempotent** — safe to run multiple times.

### What the seed creates on a fresh database
| Resource     | Details                                      |
|--------------|----------------------------------------------|
| `testUser`   | Regular user — `Test1234`                    |
| `admin`      | Admin user — `Admin@1234`, `is_admin = TRUE` |
| 15 products  | With names, prices, quantities, image URLs   |

### Manually re-run seed (without restarting the server)
```bash
cd backend && venv\Scripts\activate
python -c "
import asyncio
async def run():
    from app.core.database import AsyncSessionLocal
    from app.seed import run_seed
    async with AsyncSessionLocal() as s:
        await run_seed(s)
        await s.commit()
asyncio.run(run())
"
```

---

## 6. Reset / Fix a User Password

If a user cannot log in, reset their password directly:

```bash
cd backend && venv\Scripts\activate
python -c "
import asyncio
async def reset():
    from app.core.database import AsyncSessionLocal
    from app.core.deps import hash_password
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        h = hash_password('NewPassword123')
        await db.execute(text(\"UPDATE users SET hashed_password = :h WHERE username = :u\"), {'h': h, 'u': 'admin'})
        await db.commit()
        print('Password reset complete.')
asyncio.run(reset())
"
```
Replace `'NewPassword123'` and `'admin'` as needed.

---

## 7. Make a User an Admin

```bash
cd backend && venv\Scripts\activate
python -c "
import asyncio
async def promote():
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        await db.execute(text(\"UPDATE users SET is_admin = TRUE WHERE username = :u\"), {'u': 'admin'})
        await db.commit()
        print('User promoted to admin.')
asyncio.run(promote())
"
```

---

## 8. Check Current Database State

```bash
cd backend && venv\Scripts\activate
python -c "
import asyncio
async def check():
    from app.core.database import AsyncSessionLocal
    from sqlalchemy import text
    async with AsyncSessionLocal() as db:
        r = await db.execute(text('SELECT username, email, is_admin FROM users ORDER BY username'))
        print('--- USERS ---')
        for row in r.fetchall():
            print(f'  {row.username:<15} is_admin={row.is_admin}  {row.email}')
        r2 = await db.execute(text('SELECT COUNT(*) FROM products'))
        print(f'--- PRODUCTS: {r2.scalar()} ---')
        r3 = await db.execute(text('SELECT status, COUNT(*) FROM orders GROUP BY status'))
        print('--- ORDERS ---')
        for row in r3.fetchall():
            print(f'  {row.status}: {row[1]}')
asyncio.run(check())
"
```

---

## 9. API Documentation

With the backend running:
- **Swagger UI** → http://localhost:8000/docs
- **ReDoc**      → http://localhost:8000/redoc
- **Health**     → http://localhost:8000/health

---

## 10. Order Status Flow (Admin Feature)

```
PENDING  ──→  CONFIRMED  ──→  DELIVERED
   │               │
   └───────────────┴──→  CANCELLED
```

| Status      | Meaning                            | Who can set it       |
|-------------|------------------------------------|----------------------|
| `PENDING`   | Order placed, awaiting action      | Auto on create       |
| `CONFIRMED` | Order approved / accepted          | Admin only           |
| `DELIVERED` | Order fulfilled / success          | Admin only           |
| `CANCELLED` | Order cancelled (status-only)      | Admin only (no stock restore) |

> **Two types of cancel:**
> - **Admin status change** → just labels the order `CANCELLED`, stock is NOT restored.
> - **User "Cancel Order" button** → deletes the order record AND restores stock quantities.

---

## 11. Deployment (Railway + Vercel)

### Backend → Railway
1. Push code to GitHub.
2. Connect Railway to the repo; it auto-detects `backend/Dockerfile`.
3. Add a **PostgreSQL** plugin — Railway injects `DATABASE_URL` automatically.
4. Set environment variables in Railway dashboard:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   JWT_SECRET_KEY=<generate a strong random key>
   DEBUG=false
   ```
5. On first deploy, the Dockerfile CMD runs:
   ```
   alembic upgrade head && uvicorn app.main:app ...
   ```
   This applies migrations **and** seeds default users/products automatically.

### Frontend → Vercel
1. Connect Vercel to the same GitHub repo.
2. Set **Root Directory** = `frontend`.
3. Set environment variable:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   ```
4. Deploy — Vercel rebuilds on every push to `main`.

---

## 12. Common Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `invalid input value for enum orderstatus` | Raw SQL using lowercase status names | Use uppercase: `'PENDING'`, `'CONFIRMED'`, `'DELIVERED'`, `'CANCELLED'` |
| `alembic upgrade` fails: `target database is not up to date` | Multiple heads | Run `alembic merge heads` then `alembic upgrade head` |
| Admin login returns 401 | `is_admin` column missing or password wrong | Run migration + fix password (see §6 and §7) |
| Frontend shows blank page | `VITE_API_URL` not set or wrong | Check `.env` file in `frontend/` |
| `MissingGreenlet` error in SQLAlchemy | Accessing lazy relationship in async context | Use `selectinload()` in the repository query |
| Products show no images | `image_url` column missing | Run `alembic upgrade head` |
