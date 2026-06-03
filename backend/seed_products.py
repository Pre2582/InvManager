"""
Seed script — inserts 15 realistic products with images.
Run from backend/ with the venv active:
    python seed_products.py

Skips products whose SKU already exists.
"""
import asyncio

PRODUCTS = [
    {
        "name": "Mechanical Keyboard Pro",
        "sku": "KB-MECH-PRO",
        "price": 149.99,
        "quantity": 45,
        "description": "RGB backlit mechanical keyboard with Cherry MX Red switches, TKL layout.",
        "image_url": "https://images.unsplash.com/photo-1587829741460-b40af6e70b43?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Ergonomic Wireless Mouse",
        "sku": "MS-ERGO-WL",
        "price": 69.99,
        "quantity": 80,
        "description": "Vertical ergonomic design, 2.4GHz wireless, 6 programmable buttons.",
        "image_url": "https://images.unsplash.com/photo-1527864550417-7519f6e4f1d0?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": '27" 4K UHD Monitor',
        "sku": "MON-27-4K",
        "price": 549.00,
        "quantity": 18,
        "description": "IPS panel, 144Hz refresh rate, HDR400, USB-C 65W charging, VESA mount.",
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Noise-Cancelling Headphones",
        "sku": "HP-NC-WL",
        "price": 299.00,
        "quantity": 35,
        "description": "Active noise cancellation, 30-hour battery, premium audio drivers.",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "USB-C 10-in-1 Hub",
        "sku": "HUB-USBC-10",
        "price": 79.99,
        "quantity": 120,
        "description": "4K HDMI, 3× USB-A 3.0, SD/MicroSD, Ethernet, 100W PD pass-through.",
        "image_url": "https://images.unsplash.com/photo-1618478594486-c65b899c4936?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Ergonomic Office Chair",
        "sku": "CHR-ERGO-01",
        "price": 399.00,
        "quantity": 12,
        "description": "Lumbar support, adjustable armrests, breathable mesh back, 5-year warranty.",
        "image_url": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Height-Adjustable Standing Desk",
        "sku": "DSK-STAND-L",
        "price": 699.00,
        "quantity": 8,
        "description": "Electric dual-motor, 60×30\" tabletop, memory presets, cable management tray.",
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "4K Streaming Webcam",
        "sku": "CAM-4K-USB",
        "price": 129.99,
        "quantity": 55,
        "description": "4K 30fps, auto-focus, dual noise-cancelling mics, privacy shutter.",
        "image_url": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Portable External SSD 1TB",
        "sku": "SSD-EXT-1TB",
        "price": 109.99,
        "quantity": 75,
        "description": "USB 3.2 Gen2, up to 1,050MB/s read, shock-resistant, compact aluminium body.",
        "image_url": "https://images.unsplash.com/photo-1591238372335-3b6c9c0e8f52?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Adjustable Laptop Stand",
        "sku": "STD-LAPTOP-A",
        "price": 49.99,
        "quantity": 95,
        "description": "Aluminium alloy, 6 height & angle levels, foldable, compatible 10-17\" laptops.",
        "image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "LED Desk Lamp",
        "sku": "LMP-LED-USB",
        "price": 39.99,
        "quantity": 140,
        "description": "5 colour temperatures, 10 brightness levels, USB-A charging port, touch control.",
        "image_url": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Wireless Charging Pad",
        "sku": "CHG-WL-15W",
        "price": 29.99,
        "quantity": 200,
        "description": "15W fast charge, Qi-compatible, non-slip base, LED indicator, slim profile.",
        "image_url": "https://images.unsplash.com/photo-1608751819407-8c8672b2b6b7?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Smart Power Strip (6-Outlet)",
        "sku": "PWR-STRIP-S6",
        "price": 54.99,
        "quantity": 60,
        "description": "4 USB-A + 1 USB-C ports, surge protection, individually controlled outlets.",
        "image_url": "https://images.unsplash.com/photo-1625845779296-1a3da0c5a1d0?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Mechanical Numpad",
        "sku": "NP-MECH-BT",
        "price": 59.99,
        "quantity": 40,
        "description": "Bluetooth 5.0, hot-swappable switches, aluminium frame, programmable macros.",
        "image_url": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=400&fit=crop&auto=format",
    },
    {
        "name": "Cable Management Box",
        "sku": "CBL-BOX-LG",
        "price": 24.99,
        "quantity": 7,
        "description": "Hides power strips and cables, 15×5×6\" interior, ventilated design, bamboo lid.",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format",
    },
]


async def seed():
    from app.core.config import settings
    from app.core.database import Base
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    from sqlalchemy import text

    engine = create_async_engine(settings.async_database_url, echo=False)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    # Fetch existing SKUs to avoid duplicates
    async with Session() as db:
        result = await db.execute(text("SELECT sku FROM products"))
        existing_skus = {row[0] for row in result.fetchall()}

    inserted = 0
    skipped = 0

    async with Session() as db:
        for p in PRODUCTS:
            if p["sku"] in existing_skus:
                print(f"  SKIP  {p['sku']} — already exists")
                skipped += 1
                continue

            await db.execute(
                text("""
                    INSERT INTO products (id, name, sku, price, quantity, description, image_url, created_at, updated_at)
                    VALUES (
                        gen_random_uuid(),
                        :name, :sku, :price, :quantity, :description, :image_url,
                        NOW(), NOW()
                    )
                """),
                {
                    "name":        p["name"],
                    "sku":         p["sku"],
                    "price":       p["price"],
                    "quantity":    p["quantity"],
                    "description": p["description"],
                    "image_url":   p["image_url"],
                },
            )
            print(f"  INSERT {p['sku']} — {p['name']}")
            inserted += 1

        await db.commit()

    await engine.dispose()
    print(f"\nDone — {inserted} inserted, {skipped} skipped.")


if __name__ == "__main__":
    asyncio.run(seed())
