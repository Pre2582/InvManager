# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Inventory & Order Management System: FastAPI backend + React 18 frontend + PostgreSQL, fully containerized. Backend targets Railway, frontend targets Vercel.

---

## Commands

### Backend (run from `backend/`)

```bash
# Install deps
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run migrations
alembic upgrade head

# Generate a new migration after model changes
alembic revision --autogenerate -m "describe the change"
```

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

**Base repository** (`repositories/base.py`) is generic over `ModelType` and provides `get_by_id`, `get_all`, `create`, `delete`, `count`. Domain repos extend it with domain-specific queries (e.g., `get_by_sku`, `get_all_with_details`).

**Key business rules in services:**
- SKU uniqueness and email uniqueness are checked in service before insert (`ConflictError` → 409)
- `OrderService.create_order`: validates all products exist, checks stock for every item (fail-fast before any writes), then deducts stock and creates order items in a single `flush`
- `OrderService.cancel_order`: restores stock for each line item before deleting the order
- `ProductUpdate` schema intentionally excludes `sku` — SKU is immutable after creation

**Exception classes** (`exceptions/handlers.py`): `NotFoundError` (404), `ConflictError` (409), `UnprocessableError` (422), `BadRequestError` (400). All extend `AppException`.

**Async everywhere**: SQLAlchemy `AsyncSession` + `asyncpg` driver. All repo/service methods are `async def`. The Alembic `env.py` uses `async_engine_from_config`.

**Database URL handling**: `config.py` normalises `postgres://` and `postgresql://` to `postgresql+asyncpg://` so Railway's injected `DATABASE_URL` works unchanged.

---

### Frontend — Feature-Based + Custom Hooks

```
src/
  api/           # Axios client (client.js) + one module per entity
  hooks/         # useProducts, useCustomers, useOrders, useDashboard, useToast
  store/         # Zustand: toastStore.js (toast queue), uiStore.js (sidebar state)
  utils/         # formatters.js (currency, date, shortId, statusVariant)
                 # validators.js (validateProduct, validateCustomer, validateOrder)
  components/
    common/      # Button, Badge, Modal, DataTable, StatCard, LoadingSpinner, Toast
    layout/      # Sidebar, Header, Layout
  features/
    products/    # ProductModal (create + edit)
    customers/   # CustomerModal
    orders/      # CreateOrderModal, OrderDetailModal
  pages/         # Dashboard, Products, Customers, Orders
  styles/        # globals.css (CSS variables, reset), Page.module.css (shared page chrome)
```

**State management**: Custom hooks (`useProducts` etc.) own local component state (array + loading + error). Zustand is used only for cross-cutting concerns: toast queue and sidebar collapse.

**API client** (`src/api/client.js`): Axios instance with base URL from `VITE_API_URL` env var (empty = relative, uses Vite proxy in dev). Response interceptor unwraps `response.data` on success and normalises error messages from `detail` / `message` / `error.message`.

**Toast system**: `useToast()` hook → `useToastStore.addToast()` → auto-removes after 4 s. Toast container (`<Toast />`) is rendered outside `<Layout>` in `App.jsx`.

**Routing**: React Router v6. All routes are children of `<Layout>`. `/` redirects to `/dashboard`. Page transitions use Framer Motion `AnimatePresence` keyed on `pathname`.

**Styling**: CSS Modules + CSS custom properties. Global variables are defined in `src/styles/globals.css` (colours, radii, shadows, sidebar width, header height). No Tailwind.

**Animation approach**: Framer Motion for page transitions, modal scale/fade, list stagger, and card hover. `StatCard` uses a `useCountUp` hook for animated number counters on the dashboard.

**DataTable** (`components/common/DataTable.jsx`): Client-side search (across all `accessor` columns) + sort. Accepts a `columns` config array with optional `render` function, `sortable` flag, and `accessor`. Pass `actions` render prop for per-row action buttons.

---

## Environment Variables

### Backend (`.env` / Railway dashboard)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Railway injects automatically) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `DEBUG` | Set `true` to enable SQLAlchemy query logging |

### Frontend (`.env` / Vercel dashboard)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (empty string in dev — uses Vite proxy) |

---

## Docker

Three services in `docker-compose.yml`: `db` (postgres:15-alpine), `backend` (FastAPI on :8000), `frontend` (Nginx on :80). Backend waits for DB healthcheck before starting. Migrations run at container startup via the Railway `startCommand` or the `CMD` in the backend Dockerfile.

Frontend Dockerfile accepts `VITE_API_URL` as a build-arg — it must be set at image build time (Vite bakes it in).

---

## Deployment

**Railway** (backend): Detects `backend/Dockerfile`. Set `DATABASE_URL`, `ALLOWED_ORIGINS` in Railway env. Add PostgreSQL plugin — it injects `DATABASE_URL` automatically. Health endpoint: `GET /health`.

**Vercel** (frontend): Root directory = `frontend/`. Set `VITE_API_URL` to Railway backend URL. Auto-deploys on push.

**Docker Hub**: Build with `docker build -t <user>/inventory-backend:latest ./backend`.
