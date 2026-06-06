"""Slide repository."""
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.slide import Slide
from app.repositories.base import BaseRepository


class SlideRepository(BaseRepository[Slide]):

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Slide, session)

    async def get_active(self) -> List[Slide]:
        result = await self.session.execute(
            select(Slide)
            .where(Slide.is_active == True)  # noqa: E712
            .order_by(Slide.sort_order.asc(), Slide.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_all_ordered(self) -> List[Slide]:
        result = await self.session.execute(
            select(Slide).order_by(Slide.sort_order.asc(), Slide.created_at.asc())
        )
        return list(result.scalars().all())

    async def update(self, slide: Slide, **kwargs) -> Slide:
        for key, value in kwargs.items():
            setattr(slide, key, value)
        self.session.add(slide)
        await self.session.flush()
        await self.session.refresh(slide)
        return slide
