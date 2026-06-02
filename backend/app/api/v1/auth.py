"""Authentication endpoints for sign-up and login."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, hash_password, verify_password, create_access_token
from app.exceptions.handlers import ConflictError, UnauthorizedError
from app.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    """
    Register a new user in the system.
    Validates that username and email are unique.
    """
    user_repo = UserRepository(db)

    # Validate username uniqueness
    existing_username = await user_repo.get_by_username(payload.username)
    if existing_username:
        raise ConflictError("Username is already taken. Please choose another.")

    # Validate email uniqueness
    existing_email = await user_repo.get_by_email(payload.email)
    if existing_email:
        raise ConflictError("Email is already registered. Please login or use another email.")

    # Hash password and store user
    hashed = hash_password(payload.password)
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hashed
    )
    
    await user_repo.create(new_user)
    return new_user


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)) -> dict:
    """
    Authenticate user using username or email and return a JWT access token.
    """
    user_repo = UserRepository(db)
    
    # Allow logging in via either email (if containing '@') or username
    if "@" in credentials.username:
        user = await user_repo.get_by_email(credentials.username)
    else:
        user = await user_repo.get_by_username(credentials.username)

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise UnauthorizedError("Invalid username/email or password.")

    # Generate token
    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer"
    }
