"""FastAPI dependency injectors and security utilities."""
from datetime import datetime, timedelta, timezone
from typing import AsyncGenerator, Optional
import bcrypt
import jwt

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.exceptions.handlers import UnauthorizedError, ForbiddenError
from app.models.user import User
from app.repositories.user_repo import UserRepository

# OAuth2 scheme for JWT token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ─── Database Dependency ──────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session, committing on success and rolling back on error."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ─── Password Utilities ────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hashed value."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False


# ─── JWT Utilities ─────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new signed JWT access token (expires in ACCESS_TOKEN_EXPIRE_MINUTES)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a signed JWT refresh token (expires in REFRESH_TOKEN_EXPIRE_MINUTES)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and return the JWT payload; raises UnauthorizedError on any failure."""
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired.")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token.")


# ─── Current User Dependency ──────────────────────────────────────────────────

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Decode access token and return the authenticated user."""
    if not token:
        raise UnauthorizedError("Authentication token is missing. Please log in.")

    payload  = decode_token(token)
    if payload.get("type") != "access":
        raise UnauthorizedError("A valid access token is required.")
    username = payload.get("sub")
    if not username:
        raise UnauthorizedError("Token is missing user identifier.")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_username(username)
    if user is None:
        raise UnauthorizedError("User associated with this token does not exist.")
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that ensures the caller is an admin user."""
    if not current_user.is_admin:
        raise ForbiddenError("Admin access required to perform this action.")
    return current_user
