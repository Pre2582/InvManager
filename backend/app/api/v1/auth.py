"""Authentication endpoints for sign-up, login, and token refresh."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import (
    get_db, hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.exceptions.handlers import ConflictError, UnauthorizedError
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    """Register a new user. Validates username and email uniqueness."""
    user_repo = UserRepository(db)

    if await user_repo.get_by_username(payload.username):
        raise ConflictError("Username is already taken. Please choose another.")

    if await user_repo.get_by_email(payload.email):
        raise ConflictError("Email is already registered. Please login or use another email.")

    hashed = hash_password(payload.password)
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed,
    )
    await user_repo.create(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)) -> dict:
    """Authenticate via username or email; return access + refresh tokens."""
    user_repo = UserRepository(db)

    if "@" in credentials.username:
        user = await user_repo.get_by_email(credentials.username)
    else:
        user = await user_repo.get_by_username(credentials.username)

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedError("Invalid username/email or password.")

    token_data = {"sub": user.username, "is_admin": user.is_admin}
    return {
        "access_token":  create_access_token(token_data),
        "refresh_token": create_refresh_token({"sub": user.username}),
        "token_type":    "bearer",
    }


@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)) -> dict:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    token_payload = decode_token(payload.refresh_token)

    if token_payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type. A refresh token is required.")

    username: str = token_payload.get("sub")
    if not username:
        raise UnauthorizedError("Refresh token is missing user identifier.")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(username)
    if not user:
        raise UnauthorizedError("User no longer exists.")

    token_data = {"sub": user.username, "is_admin": user.is_admin}
    return {
        "access_token":  create_access_token(token_data),
        "refresh_token": create_refresh_token({"sub": user.username}),
        "token_type":    "bearer",
    }
