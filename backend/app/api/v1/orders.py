"""Orders API router."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"], dependencies=[Depends(get_current_user)])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """
    Create a new order.
    - Validates customer and product existence.
    - Checks sufficient stock for every line item.
    - Atomically deducts stock and persists the order.
    - Auto-calculates total_amount.
    """
    return await OrderService(db).create_order(payload)


@router.get("", response_model=List[OrderResponse])
async def list_orders(db: AsyncSession = Depends(get_db)) -> List[OrderResponse]:
    """Retrieve all orders with customer and item details."""
    return await OrderService(db).get_all_orders()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """Retrieve a single order with full details."""
    return await OrderService(db).get_order(order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Cancel/delete an order and restore product stock."""
    await OrderService(db).cancel_order(order_id)
