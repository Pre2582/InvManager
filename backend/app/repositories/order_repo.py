"""Order repository — extends BaseRepository with eager-loaded order queries."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Order, session)

    async def get_by_id_with_details(self, order_id: UUID) -> Optional[Order]:
        """Fetch a single order with its customer and fully hydrated items."""
        result = await self.session.execute(
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.customer),
                selectinload(Order.items).selectinload(OrderItem.product),
            )
        )
        return result.scalar_one_or_none()

    async def get_all_with_details(self, skip: int = 0, limit: int = 500) -> List[Order]:
        """Fetch all orders with customer + items eagerly loaded."""
        result = await self.session.execute(
            select(Order)
            .offset(skip)
            .limit(limit)
            .options(
                selectinload(Order.customer),
                selectinload(Order.items).selectinload(OrderItem.product),
            )
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_orders_by_day(self, days: int = 7) -> List[dict]:
        """Return order counts grouped by day for the past N days."""
        since = datetime.now(timezone.utc) - timedelta(days=days)
        result = await self.session.execute(
            text(
                """
                SELECT
                    DATE(created_at AT TIME ZONE 'UTC') AS date,
                    COUNT(*)::int AS count
                FROM orders
                WHERE created_at >= :since
                GROUP BY DATE(created_at AT TIME ZONE 'UTC')
                ORDER BY date ASC
                """
            ),
            {"since": since},
        )
        return [{"date": str(row.date), "count": row.count} for row in result]
