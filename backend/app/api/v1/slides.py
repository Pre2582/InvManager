"""Slides API router — landing page carousel management."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_current_user, get_admin_user
from app.schemas.slide import SlideCreate, SlideResponse, SlideUpdate
from app.services.slide_service import SlideService

router = APIRouter(prefix="/slides", tags=["Slides"])


@router.get("", response_model=List[SlideResponse])
async def list_active_slides(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_current_user),
) -> List[SlideResponse]:
    """Return active slides ordered by sort_order (for the user landing page)."""
    return await SlideService(db).get_active_slides()


@router.get("/all", response_model=List[SlideResponse])
async def list_all_slides(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_admin_user),
) -> List[SlideResponse]:
    """Return ALL slides including inactive (admin only)."""
    return await SlideService(db).get_all_slides()


@router.post("", response_model=SlideResponse, status_code=status.HTTP_201_CREATED)
async def create_slide(
    payload: SlideCreate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_admin_user),
) -> SlideResponse:
    """Create a new landing-page slide (admin only)."""
    return await SlideService(db).create_slide(payload)


@router.put("/{slide_id}", response_model=SlideResponse)
async def update_slide(
    slide_id: UUID,
    payload: SlideUpdate,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_admin_user),
) -> SlideResponse:
    """Update a slide (admin only)."""
    return await SlideService(db).update_slide(slide_id, payload)


@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slide(
    slide_id: UUID,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(get_admin_user),
) -> None:
    """Delete a slide (admin only)."""
    await SlideService(db).delete_slide(slide_id)
