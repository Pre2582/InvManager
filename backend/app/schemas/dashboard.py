"""Pydantic schemas for the Dashboard summary endpoint."""
from typing import List

from pydantic import BaseModel

from app.schemas.product import ProductResponse


class OrdersByDayItem(BaseModel):
    date: str
    count: int


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_products: List[ProductResponse]
    orders_by_day: List[OrdersByDayItem]

    model_config = {"from_attributes": True}
