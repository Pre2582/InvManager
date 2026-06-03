"""Dashboard summary API router."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.repositories.order_repo import OrderRepository
from app.schemas.dashboard import DashboardSummary, OrdersByStatus, RecentOrderItem
from app.services.customer_service import CustomerService
from app.services.order_service import OrderService
from app.services.product_service import ProductService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(db: AsyncSession = Depends(get_db)) -> DashboardSummary:
    product_svc = ProductService(db)
    customer_svc = CustomerService(db)
    order_svc = OrderService(db)
    order_repo = OrderRepository(db)

    total_products = await product_svc.count()
    total_customers = await customer_svc.count()
    total_orders = await order_svc.count()
    total_revenue = await order_repo.get_total_revenue()
    low_stock = await product_svc.get_low_stock_products(threshold=10)
    orders_by_day = await order_repo.get_orders_by_day(days=7)
    status_counts = await order_repo.get_orders_by_status()
    recent_raw = await order_repo.get_recent_orders(limit=5)

    recent_orders = [
        RecentOrderItem(
            id=o.id,
            customer_name=o.customer.full_name if o.customer else "Deleted Customer",
            total_amount=float(o.total_amount),
            status=o.status.value if hasattr(o.status, "value") else str(o.status),
            created_at=o.created_at,
        )
        for o in recent_raw
    ]

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_count=len(low_stock),
        low_stock_products=low_stock,
        orders_by_day=orders_by_day,
        orders_by_status=OrdersByStatus(**status_counts),
        recent_orders=recent_orders,
    )
