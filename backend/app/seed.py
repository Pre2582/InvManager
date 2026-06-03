"""
Production seed — runs automatically on every startup (idempotent).

What it does:
  1. Creates the default admin user (testUser / Test1234) if they don't exist.
  2. Inserts 15 demo products with images if the products table is empty.

Safe to run multiple times — every action is guarded by an existence check.
"""
import uuid
import logging
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.deps import hash_password
from app.models.user import User
from app.models.product import Product

log = logging.getLogger(__name__)

# ── Default admin account ─────────────────────────────────────────────────────

SEED_USER = {
    "username": "testUser",
    "email":    "testuser@inventrack.com",
    "password": "Test1234",
    "is_admin": False,
}

SEED_ADMIN = {
    "username": "admin",
    "email":    "admin@inventrack.com",
    "password": "Admin@1234",
    "is_admin": True,
}

# ── Demo product catalogue ────────────────────────────────────────────────────

SEED_PRODUCTS = [
    {
        "name":        "Mechanical Keyboard Pro",
        "sku":         "KB-MECH-PRO",
        "price":       Decimal("149.99"),
        "quantity":    45,
        "description": "RGB backlit, Cherry MX Red switches, TKL layout.",
        "image_url":   "https://images.unsplash.com/photo-1587829741460-b40af6e70b43?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Ergonomic Wireless Mouse",
        "sku":         "MS-ERGO-WL",
        "price":       Decimal("69.99"),
        "quantity":    80,
        "description": "Vertical ergonomic design, 2.4 GHz wireless, 6 programmable buttons.",
        "image_url":   "https://images.unsplash.com/photo-1527864550417-7519f6e4f1d0?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        '27" 4K UHD Monitor',
        "sku":         "MON-27-4K",
        "price":       Decimal("549.00"),
        "quantity":    18,
        "description": "IPS panel, 144 Hz, HDR400, USB-C 65 W charging, VESA mount.",
        "image_url":   "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Noise-Cancelling Headphones",
        "sku":         "HP-NC-WL",
        "price":       Decimal("299.00"),
        "quantity":    35,
        "description": "Active noise cancellation, 30-hour battery, premium audio drivers.",
        "image_url":   "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "USB-C 10-in-1 Hub",
        "sku":         "HUB-USBC-10",
        "price":       Decimal("79.99"),
        "quantity":    120,
        "description": "4K HDMI, 3× USB-A 3.0, SD/MicroSD, Ethernet, 100 W PD pass-through.",
        "image_url":   "https://images.unsplash.com/photo-1618478594486-c65b899c4936?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Ergonomic Office Chair",
        "sku":         "CHR-ERGO-01",
        "price":       Decimal("399.00"),
        "quantity":    12,
        "description": "Lumbar support, adjustable armrests, breathable mesh back, 5-year warranty.",
        "image_url":   "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Height-Adjustable Standing Desk",
        "sku":         "DSK-STAND-L",
        "price":       Decimal("699.00"),
        "quantity":    8,
        "description": "Electric dual-motor, 60×30\" tabletop, memory presets, cable management.",
        "image_url":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "4K Streaming Webcam",
        "sku":         "CAM-4K-USB",
        "price":       Decimal("129.99"),
        "quantity":    55,
        "description": "4K 30fps, auto-focus, dual noise-cancelling mics, privacy shutter.",
        "image_url":   "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Portable External SSD 1TB",
        "sku":         "SSD-EXT-1TB",
        "price":       Decimal("109.99"),
        "quantity":    75,
        "description": "USB 3.2 Gen 2, up to 1,050 MB/s read, shock-resistant aluminium body.",
        "image_url":   "https://images.unsplash.com/photo-1591238372335-3b6c9c0e8f52?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Adjustable Laptop Stand",
        "sku":         "STD-LAPTOP-A",
        "price":       Decimal("49.99"),
        "quantity":    95,
        "description": "Aluminium alloy, 6 height/angle levels, foldable, fits 10–17\" laptops.",
        "image_url":   "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "LED Desk Lamp",
        "sku":         "LMP-LED-USB",
        "price":       Decimal("39.99"),
        "quantity":    140,
        "description": "5 colour temperatures, 10 brightness levels, USB-A charging, touch control.",
        "image_url":   "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Wireless Charging Pad",
        "sku":         "CHG-WL-15W",
        "price":       Decimal("29.99"),
        "quantity":    200,
        "description": "15 W fast charge, Qi-compatible, non-slip base, slim profile.",
        "image_url":   "https://images.unsplash.com/photo-1608751819407-8c8672b2b6b7?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Smart Power Strip (6-Outlet)",
        "sku":         "PWR-STRIP-S6",
        "price":       Decimal("54.99"),
        "quantity":    60,
        "description": "4 USB-A + 1 USB-C ports, surge protection, individually controlled outlets.",
        "image_url":   "https://images.unsplash.com/photo-1625845779296-1a3da0c5a1d0?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Mechanical Numpad",
        "sku":         "NP-MECH-BT",
        "price":       Decimal("59.99"),
        "quantity":    40,
        "description": "Bluetooth 5.0, hot-swappable switches, aluminium frame, programmable macros.",
        "image_url":   "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name":        "Cable Management Box",
        "sku":         "CBL-BOX-LG",
        "price":       Decimal("24.99"),
        "quantity":    7,
        "description": "Hides power strips and cables, 15×5×6\" interior, ventilated bamboo lid.",
        "image_url":   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    },
]


# ── Seed functions ────────────────────────────────────────────────────────────

async def _seed_one_user(session: AsyncSession, spec: dict) -> None:
    """Create a user if they don't exist, or promote them to admin if the spec requires it."""
    existing = await session.scalar(select(User).where(User.username == spec["username"]))
    if existing:
        # Promote to admin if the spec says so and they aren't already
        if spec.get("is_admin") and not existing.is_admin:
            existing.is_admin = True
            session.add(existing)
            await session.flush()
            log.info("seed: promoted user '%s' to admin", spec["username"])
        else:
            log.info("seed: user '%s' already exists — skipped", spec["username"])
        return
    session.add(User(
        id=uuid.uuid4(),
        username=spec["username"],
        email=spec["email"],
        hashed_password=hash_password(spec["password"]),
        is_admin=spec.get("is_admin", False),
    ))
    await session.flush()
    log.info("seed: created user '%s' (is_admin=%s)", spec["username"], spec.get("is_admin", False))


async def _seed_user(session: AsyncSession) -> None:
    """Create the default user accounts if they don't already exist."""
    await _seed_one_user(session, SEED_USER)
    await _seed_one_user(session, SEED_ADMIN)


async def _seed_products(session: AsyncSession) -> None:
    """Insert demo products that don't already exist (keyed by SKU)."""
    # Fetch all SKUs currently in the table in one query
    existing_skus = set(
        await session.scalars(select(Product.sku))
    )

    new_products = []
    for p in SEED_PRODUCTS:
        if p["sku"] in existing_skus:
            log.debug("seed: product '%s' already exists — skipped", p["sku"])
            continue
        new_products.append(
            Product(
                id=uuid.uuid4(),
                name=p["name"],
                sku=p["sku"],
                price=p["price"],
                quantity=p["quantity"],
                description=p.get("description"),
                image_url=p.get("image_url"),
            )
        )

    if not new_products:
        log.info("seed: all %d demo products already present — skipped", len(SEED_PRODUCTS))
        return

    session.add_all(new_products)
    await session.flush()
    log.info("seed: inserted %d demo product(s)", len(new_products))


async def run_seed(session: AsyncSession) -> None:
    """Entry point — called from the FastAPI lifespan after table creation."""
    log.info("seed: running startup seed …")
    await _seed_user(session)
    await _seed_products(session)
    log.info("seed: done")
