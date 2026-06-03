# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Inventory & Order Management System (InvenTrack): FastAPI backend + React 18 frontend + PostgreSQL, fully containerized. Backend targets Railway, frontend targets Vercel.

---

## Commands

### Backend (run from `backend/`)

```bash
pip install -r requirements.txt

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run migrations (after model changes)
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

> **Note:** There are no tests. The `alembic/versions/` directory is currently empty — tables are created via `metadata.create_all()` on app startup, not through Alembic migrations.

### Frontend (run from `frontend/`)

```bash
npm install
npm run dev       # Vite dev server on :5173 (proxies /api → :8000)
npm run build     # Production build → dist/
npm run lint      # ESLint
```

### Docker (run from repo root)

```bash
docker compose up --build        # Start all 3 services (db, backend, frontend)
docker compose down -v           # Stop and remove volumes
```

After `docker compose up`: frontend at `http://localhost`, API docs at `http://localhost:8000/docs`.

---

## Architecture

### Backend — Clean Architecture + Repository Pattern

```
app/
  api/v1/          # Thin route handlers — delegate immediately to services
  core/            # config.py (Settings via pydantic-settings), database.py, deps.py
  models/          # SQLAlchemy 2.0 ORM (UUID PKs, TimestampMixin)
  schemas/         # Pydantic v2 DTOs — separate Create / Update / Response per entity
  repositories/    # base.py (generic CRUD), then domain subclasses
  services/        # All business logic lives here
  exceptions/      # AppException hierarchy → FastAPI handler converts to JSON
```

**Data flow:** Route handler → Service → Repository → DB session

**Session lifecycle:** `get_db()` (in `core/deps.py`) yields a session, commits on success, rolls back on any exception. Routes depend on this via `Depends(get_db)`.

**Base repository** (`repositories/base.py`) is generic over `ModelType` and provides `get_by_id`, `get_all`, `create`, `delete`, `count`. Domain repos extend it with domain-specific queries (e.g., `get_by_sku`, `get_low_stock`).

**Key business rules in services:**
- SKU uniqueness and email uniqueness are checked in service before insert (`ConflictError` → 409)
- `OrderService.create_order`: validates all products exist, checks stock for every item (fail-fast before any writes), then deducts stock and creates order items in a single `flush`
- `OrderService.cancel_order`: restores stock for each line item before deleting the order
- `ProductUpdate` schema intentionally excludes `sku` — SKU is immutable after creation

**Exception classes** (`exceptions/handlers.py`): `NotFoundError` (404), `ConflictError` (409), `UnprocessableError` (422), `BadRequestError` (400), `UnauthorizedError` (401). All extend `AppException`.

**Async everywhere**: SQLAlchemy `AsyncSession` + `asyncpg` driver. All repo/service methods are `async def`. The Alembic `env.py` uses `async_engine_from_config`. Connection pool: size=10, max_overflow=20.

**Database URL handling**: `config.py` normalises `postgres://` and `postgresql://` to `postgresql+asyncpg://` so Railway's injected `DATABASE_URL` works unchanged.

**Authentication** (`core/deps.py`):
- `hash_password()` / `verify_password()` — bcrypt
- `create_access_token()` / `get_current_user()` — JWT (HS256)
- Login accepts **username or email** — the service checks for `@` to distinguish them
- All `/products`, `/customers`, `/orders`, `/dashboard` routes require `Depends(get_current_user)`

---

### Frontend — Feature-Based + Custom Hooks

```
src/
  api/           # Axios client (client.js) + one module per entity
  hooks/         # useProducts, useCustomers, useOrders, useDashboard, useToast
  store/         # Zustand: authStore.js (JWT + localStorage), toastStore.js, uiStore.js
  utils/         # formatters.js (currency, date, shortId, statusVariant)
                 # validators.js (validateProduct, validateCustomer, validateOrder)
  components/
    common/      # Button, Badge, Modal, DataTable, StatCard, LoadingSpinner, Toast, ConfirmDialog
    layout/      # Sidebar, Header, Layout
  features/
    products/    # ProductModal (create + edit)
    customers/   # CustomerModal
    orders/      # CreateOrderModal, OrderDetailModal
  pages/         # Dashboard, Products, Customers, Orders, Login, Signup
  styles/        # globals.css (CSS variables, reset), Page.module.css (shared page chrome)
```

**State management**: Custom hooks (`useProducts` etc.) own local component state. Zustand is used for cross-cutting concerns: auth state, toast queue, and sidebar collapse.

**Auth store** (`store/authStore.js`): Stores JWT token in localStorage under key `inv_token`. On init it validates the stored token's expiry and clears it if expired. `ProtectedRoute` checks this token; unauthenticated users are redirected to `/login`.

**API client** (`src/api/client.js`): Axios instance with base URL `${VITE_API_URL}/api/v1`, 15 s timeout. Request interceptor attaches `Authorization: Bearer <inv_token>`. Response interceptor unwraps `response.data` and normalises error messages from `detail` / `message` / `error.message`.

**Toast system**: `useToast()` hook → `useToastStore.addToast()` → auto-removes after 4 s. Toast container (`<Toast />`) is rendered outside `<Layout>` in `App.jsx`.

**Routing**: React Router v6. Public routes: `/login`, `/signup`. All other routes are children of `<Layout>` wrapped in `<ProtectedRoute>`. `/` redirects to `/dashboard`. Page transitions use Framer Motion `AnimatePresence` keyed on `pathname`.

**Styling**: CSS Modules + CSS custom properties (dark/glassmorphic theme). Global variables in `src/styles/globals.css`. No Tailwind.

**DataTable** (`components/common/DataTable.jsx`): Client-side search (across all `accessor` columns) + sort. Accepts `columns` config array with optional `render`, `sortable`, and `accessor`. Pass `actions` render prop for per-row buttons.

**CSV import/export**: Products and Customers pages support bulk CSV upload and download.

---

## Environment Variables

### Backend (`.env` / Railway dashboard)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Railway injects automatically) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `DEBUG` | Set `true` to enable SQLAlchemy query logging |
| `JWT_SECRET_KEY` | Secret for signing JWTs — **must be changed in production** |
| `JWT_ALGORITHM` | Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Default: `60` |

### Frontend (`.env` / Vercel dashboard)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (empty string in dev — uses Vite proxy) |

---

## Docker

Three services in `docker-compose.yml`: `db` (postgres:15-alpine), `backend` (FastAPI on :8000), `frontend` (Nginx on :80). Backend waits for DB healthcheck before starting. Tables are created at startup via SQLAlchemy `metadata.create_all()`.

Frontend Dockerfile accepts `VITE_API_URL` as a build-arg — it must be set at image build time (Vite bakes it in).

---

## Deployment

**Railway** (backend): Detects `backend/Dockerfile`. Set `DATABASE_URL`, `ALLOWED_ORIGINS`, `JWT_SECRET_KEY` in Railway env. Add PostgreSQL plugin — it injects `DATABASE_URL` automatically. Health endpoint: `GET /health`.

**Vercel** (frontend): Root directory = `frontend/`. Set `VITE_API_URL` to Railway backend URL. Auto-deploys on push.
