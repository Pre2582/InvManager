"""Pydantic schemas for the Dashboard summary endpoint."""
from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel

from app.schemas.product import ProductResponse


class OrdersByDayItem(BaseModel):
    date: str
    count: int


class OrdersByStatus(BaseModel):
    pending: int = 0
    confirmed: int = 0
    cancelled: int = 0


class RecentOrderItem(BaseModel):
    id: UUID
    customer_name: str
    total_amount: float
    status: str
    created_at: datetime


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_count: int
    low_stock_products: List[ProductResponse]
    orders_by_day: List[OrdersByDayItem]
    orders_by_status: OrdersByStatus
    recent_orders: List[RecentOrderItem]

    model_config = {"from_attributes": True}
