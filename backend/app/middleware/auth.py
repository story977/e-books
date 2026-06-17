"""JWT authentication middleware and dependency."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.config import settings
import logging

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer()


def verify_admin_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency — validates admin JWT token.
    
    Usage:
        @router.get("/protected")
        async def route(admin = Depends(verify_admin_token)):
            ...
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired admin token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        username: str = payload.get("sub")
        token_type: str = payload.get("type")

        if not username or token_type != "admin":
            raise credentials_exception

        return {"username": username}

    except JWTError as e:
        logger.warning(f"Admin token validation failed: {e}")
        raise credentials_exception
