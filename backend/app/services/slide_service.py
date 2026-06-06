"""Slide service — business logic for the landing page carousel."""
from typing import List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.handlers import NotFoundError
from app.models.slide import Slide
from app.repositories.slide_repo import SlideRepository
from app.schemas.slide import SlideCreate, SlideUpdate


class SlideService:

    def __init__(self, session: AsyncSession) -> None:
        self._repo = SlideRepository(session)

    async def get_active_slides(self) -> List[Slide]:
        return await self._repo.get_active()

    async def get_all_slides(self) -> List[Slide]:
        return await self._repo.get_all_ordered()

    async def get_slide(self, slide_id: UUID) -> Slide:
        slide = await self._repo.get_by_id(slide_id)
        if not slide:
            raise NotFoundError(f"Slide '{slide_id}' not found.")
        return slide

    async def create_slide(self, data: SlideCreate) -> Slide:
        slide = Slide(**data.model_dump())
        return await self._repo.create(slide)

    async def update_slide(self, slide_id: UUID, data: SlideUpdate) -> Slide:
        slide = await self.get_slide(slide_id)
        return await self._repo.update(slide, **data.model_dump(exclude_none=True))

    async def delete_slide(self, slide_id: UUID) -> None:
        slide = await self.get_slide(slide_id)
        await self._repo.delete(slide)
