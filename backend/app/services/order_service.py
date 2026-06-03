"""Order service — business logic for order creation with stock management."""
from decimal import Decimal
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.handlers import NotFoundError, UnprocessableError
from app.models.order import Order, OrderItem
from app.repositories.customer_repo import CustomerRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.order import OrderCreate


class OrderService:
    """
    Handles order lifecycle: creation (with stock deduction) and cancellation
    (with stock restoration). All DB writes happen in a single unit-of-work.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._order_repo = OrderRepository(session)
        self._product_repo = ProductRepository(session)
        self._customer_repo = CustomerRepository(session)
        self._session = session

    async def create_order(self, data: OrderCreate) -> Order:
        # 1. Validate customer exists
        customer = await self._customer_repo.get_by_id(data.customer_id)
        if not customer:
            raise NotFoundError(f"Customer '{data.customer_id}' not found.")

        # 2. Validate all products and check stock (fail-fast before any writes)
        validated: list[tuple] = []
        for item in data.items:
            product = await self._product_repo.get_by_id(item.product_id)
            if not product:
                raise NotFoundError(f"Product '{item.product_id}' not found.")
            if product.quantity < item.quantity:
                raise UnprocessableError(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.quantity}, Requested: {item.quantity}."
                )
            validated.append((product, item.quantity, product.price))

        # 3. Calculate total
        total_amount: Decimal = sum(
            price * qty for _, qty, price in validated
        )

        # 4. Create the Order row
        order = Order(
            customer_id=data.customer_id,
            total_amount=total_amount,
            notes=data.notes,
        )
        self._session.add(order)
        await self._session.flush()  # get order.id without committing

        # 5. Create OrderItems + atomically reduce stock
        for product, quantity, unit_price in validated:
            self._session.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=unit_price,
                )
            )
            product.quantity -= quantity
            self._session.add(product)

        await self._session.flush()

        # 6. Return fully hydrated order
        return await self._order_repo.get_by_id_with_details(order.id)

    async def get_all_orders(self) -> List[Order]:
        return await self._order_repo.get_all_with_details()

    async def get_order(self, order_id: UUID) -> Order:
        order = await self._order_repo.get_by_id_with_details(order_id)
        if not order:
            raise NotFoundError(f"Order '{order_id}' not found.")
        return order

    async def cancel_order(self, order_id: UUID) -> None:
        order = await self._order_repo.get_by_id_with_details(order_id)
        if not order:
            raise NotFoundError(f"Order '{order_id}' not found.")

        # Restore stock for each line item
        for item in order.items:
            product = await self._product_repo.get_by_id(item.product_id)
            if product:
                product.quantity += item.quantity
                self._session.add(product)

        await self._order_repo.delete(order)

    async def count(self) -> int:
        return await self._order_repo.count()

    async def update_order_status(self, order_id: UUID, new_status) -> "Order":
        """Admin-only: change the status label of an order without touching stock."""
        order = await self._order_repo.get_by_id_with_details(order_id)
        if not order:
            raise NotFoundError(f"Order '{order_id}' not found.")
        order.status = new_status
        self._session.add(order)
        await self._session.flush()
        return await self._order_repo.get_by_id_with_details(order_id)
