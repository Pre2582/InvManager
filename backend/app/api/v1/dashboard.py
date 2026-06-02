"""Dashboard summary API router."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user
from app.repositories.order_repo import OrderRepository
from app.schemas.dashboard import DashboardSummary
from app.services.customer_service import CustomerService
from app.services.order_service import OrderService
from app.services.product_service import ProductService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(db: AsyncSession = Depends(get_db)) -> DashboardSummary:
    """Return aggregated KPIs for the dashboard."""
    product_svc = ProductService(db)
    customer_svc = CustomerService(db)
    order_svc = OrderService(db)
    order_repo = OrderRepository(db)

    total_products = await product_svc.count()
    total_customers = await customer_svc.count()
    total_orders = await order_svc.count()
    low_stock = await product_svc.get_low_stock_products(threshold=10)
    orders_by_day = await order_repo.get_orders_by_day(days=7)

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_count=len(low_stock),
        low_stock_products=low_stock,
        orders_by_day=orders_by_day,
    )
