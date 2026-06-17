"""Security utilities — password hashing and JWT token creation."""

from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt
from app.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_admin_token(username: str) -> str:
    """Create a signed JWT for admin authentication.
    
    Token includes type='admin' claim to distinguish from download tokens.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.JWT_EXPIRE_MINUTES
    )
    payload = {
        "sub": username,
        "type": "admin",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def generate_order_id(book_id: str) -> str:
    """Generate a unique order ID for Cashfree."""
    import uuid
    short = str(uuid.uuid4()).replace("-", "")[:12].upper()
    return f"ORD_{short}"


def slugify(text: str) -> str:
    """Convert a book title to a URL-safe slug."""
    import re
    import unicodedata
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text
