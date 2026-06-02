"""Product repository — extends BaseRepository with product-specific queries."""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Product, session)

    async def get_by_sku(self, sku: str) -> Optional[Product]:
        result = await self.session.execute(
            select(Product).where(Product.sku == sku)
        )
        return result.scalar_one_or_none()

    async def get_low_stock(self, threshold: int = 10) -> List[Product]:
        result = await self.session.execute(
            select(Product)
            .where(Product.quantity <= threshold)
            .order_by(Product.quantity.asc())
        )
        return list(result.scalars().all())

    async def update(self, product: Product, **kwargs) -> Product:
        for key, value in kwargs.items():
            setattr(product, key, value)
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product
