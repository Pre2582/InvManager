"""Pydantic schemas for the Order domain."""
from decimal import Decimal
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.order import OrderStatus
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


# ─── Order Item ─────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0, examples=[2])


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    product: ProductResponse
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


# ─── Order ──────────────────────────────────────────────────────────────────

class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(..., min_length=1)
    notes: Optional[str] = Field(None, examples=["Rush delivery please"])


class OrderStatusUpdate(BaseModel):
    """Admin-only: update the status of an existing order."""
    status: OrderStatus


class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    customer: CustomerResponse
    items: List[OrderItemResponse]
    status: OrderStatus
    total_amount: Decimal
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
