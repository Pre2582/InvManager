"""Pydantic schemas for the Product domain."""
from decimal import Decimal
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, examples=["Laptop Pro 15"])
    sku: str = Field(..., min_length=1, max_length=100, examples=["LPRO-15-2024"])
    price: Decimal = Field(..., gt=0, decimal_places=2, examples=[1299.99])
    quantity: int = Field(..., ge=0, examples=[50])
    description: Optional[str] = Field(None, examples=["High-performance laptop"])


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for partial product update — all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    price: Optional[Decimal] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None


class ProductResponse(ProductBase):
    """Schema for product API responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
