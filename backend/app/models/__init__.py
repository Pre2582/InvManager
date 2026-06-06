"""Models package — import all models so SQLAlchemy registers them."""
from app.models.product import Product  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.order import Order, OrderItem, OrderStatus  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.slide import Slide  # noqa: F401

__all__ = ["Product", "Customer", "Order", "OrderItem", "OrderStatus", "User", "Slide"]
