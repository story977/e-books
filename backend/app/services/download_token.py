"""Download token service — generates and verifies signed JWTs for secure PDF access."""

from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

DOWNLOAD_TOKEN_TYPE = "download"


def generate_download_token(book_id: str, order_id: str) -> str:
    """Generate a signed JWT token for one-time secure download.
    
    Token payload:
        - sub: book_id
        - order_id: order_id
        - type: "download"
        - exp: now + DOWNLOAD_TOKEN_EXPIRE_MINUTES
    
    Returns:
        Signed JWT string (10-minute expiry by default)
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.DOWNLOAD_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": book_id,
        "order_id": order_id,
        "type": DOWNLOAD_TOKEN_TYPE,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_download_token(token: str) -> dict:
    """Verify and decode a download token.
    
    Returns:
        dict with book_id and order_id
    
    Raises:
        HTTPException 401: Invalid or expired token
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        if payload.get("type") != DOWNLOAD_TOKEN_TYPE:
            raise HTTPException(401, "Invalid token type")

        book_id = payload.get("sub")
        order_id = payload.get("order_id")

        if not book_id or not order_id:
            raise HTTPException(401, "Invalid token payload")

        return {"book_id": book_id, "order_id": order_id}

    except JWTError as e:
        logger.warning(f"Download token verification failed: {e}")
        raise HTTPException(401, "Download link has expired or is invalid. Please repurchase.")
