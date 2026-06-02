"""Customer service — business logic layer for the Customer domain."""
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.handlers import ConflictError, NotFoundError
from app.models.customer import Customer
from app.repositories.customer_repo import CustomerRepository
from app.schemas.customer import CustomerCreate


class CustomerService:
    """Encapsulates all customer-related business rules."""

    def __init__(self, session: AsyncSession) -> None:
        self._repo = CustomerRepository(session)

    async def create_customer(self, data: CustomerCreate) -> Customer:
        if await self._repo.get_by_email(data.email):
            raise ConflictError(f"Customer with email '{data.email}' already exists.")
        customer = Customer(**data.model_dump())
        return await self._repo.create(customer)

    async def get_all_customers(self) -> List[Customer]:
        return await self._repo.get_all()

    async def get_customer(self, customer_id: UUID) -> Customer:
        customer = await self._repo.get_by_id(customer_id)
        if not customer:
            raise NotFoundError(f"Customer '{customer_id}' not found.")
        return customer

    async def delete_customer(self, customer_id: UUID) -> None:
        customer = await self.get_customer(customer_id)
        await self._repo.delete(customer)

    async def count(self) -> int:
        return await self._repo.count()
