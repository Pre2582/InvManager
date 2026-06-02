"""Customers API router."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    """Create a new customer. Email must be unique."""
    return await CustomerService(db).create_customer(payload)


@router.get("", response_model=List[CustomerResponse])
async def list_customers(db: AsyncSession = Depends(get_db)) -> List[CustomerResponse]:
    """Retrieve all customers."""
    return await CustomerService(db).get_all_customers()


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> CustomerResponse:
    """Retrieve a customer by ID."""
    return await CustomerService(db).get_customer(customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    customer_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a customer by ID."""
    await CustomerService(db).delete_customer(customer_id)
