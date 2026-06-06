"""Pydantic schemas for the Slide domain."""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class SlideCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    badge_text: Optional[str] = None
    price: Optional[Decimal] = None
    cta_text: str = "Shop Now"
    is_active: bool = True
    sort_order: int = 0


class SlideUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    badge_text: Optional[str] = None
    price: Optional[Decimal] = None
    cta_text: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class SlideResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    subtitle: Optional[str]
    description: Optional[str]
    image_url: Optional[str]
    badge_text: Optional[str]
    price: Optional[Decimal]
    cta_text: str
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
