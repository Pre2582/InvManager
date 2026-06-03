"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import auth, customers, dashboard, orders, products
from app.core.config import settings
from app.core.database import engine, AsyncSessionLocal
from app.exceptions.handlers import AppException, app_exception_handler

# Import all models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401
from app.core.database import Base
from app.seed import run_seed


# ─── Lifespan ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """On startup: create tables → run seed data. On shutdown: dispose engine."""
    # 1. Ensure all tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Seed default user + demo products (idempotent)
    async with AsyncSessionLocal() as session:
        try:
            await run_seed(session)
            await session.commit()
        except Exception:
            await session.rollback()
            raise

    yield
    await engine.dispose()


# ─── App Factory ─────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready Inventory & Order Management REST API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers ───────────────────────────────────────────────────────

app.add_exception_handler(AppException, app_exception_handler)

# ─── Routers ─────────────────────────────────────────────────────────────────

API_V1_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_V1_PREFIX)
app.include_router(products.router, prefix=API_V1_PREFIX)
app.include_router(customers.router, prefix=API_V1_PREFIX)
app.include_router(orders.router, prefix=API_V1_PREFIX)
app.include_router(dashboard.router, prefix=API_V1_PREFIX)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check() -> JSONResponse:
    return JSONResponse(
        content={"status": "healthy", "version": settings.APP_VERSION}
    )


@app.get("/", tags=["Root"])
async def root() -> JSONResponse:
    return JSONResponse(
        content={
            "message": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
        }
    )
