"""Product service — business logic layer for the Product domain."""
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.handlers import ConflictError, NotFoundError
from app.models.product import Product
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    """Encapsulates all product-related business rules (Single Responsibility)."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = ProductRepository(session)

    async def create_product(self, data: ProductCreate) -> Product:
        if await self._repo.get_by_sku(data.sku):
            raise ConflictError(f"Product with SKU '{data.sku}' already exists.")
        product = Product(**data.model_dump())
        return await self._repo.create(product)

    async def get_all_products(self) -> List[Product]:
        return await self._repo.get_all()

    async def get_product(self, product_id: UUID) -> Product:
        product = await self._repo.get_by_id(product_id)
        if not product:
            raise NotFoundError(f"Product '{product_id}' not found.")
        return product

    async def update_product(self, product_id: UUID, data: ProductUpdate) -> Product:
        product = await self.get_product(product_id)
        update_data = data.model_dump(exclude_none=True)
        return await self._repo.update(product, **update_data)

    async def delete_product(self, product_id: UUID) -> None:
        product = await self.get_product(product_id)
        await self._repo.delete(product)

    async def get_low_stock_products(self, threshold: int = 10) -> List[Product]:
        return await self._repo.get_low_stock(threshold)

    async def count(self) -> int:
        return await self._repo.count()
