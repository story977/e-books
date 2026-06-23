from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "ebook_store"

    # JWT
    JWT_SECRET: str = "change-me-in-production-super-secret-key-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    DOWNLOAD_TOKEN_EXPIRE_MINUTES: int = 10

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Cashfree
    CASHFREE_APP_ID: str = ""
    CASHFREE_SECRET_KEY: str = ""
    CASHFREE_ENV: str = "sandbox"  # "sandbox" or "production"

    # Admin credentials
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = ""  # bcrypt hash of your admin password

    # CORS — accepts JSON array OR comma-separated string
    # e.g. in Render: https://yourapp.vercel.app,http://localhost:3000
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # URLs
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Accept JSON array, comma-separated string, or plain string."""
        if isinstance(v, list):
            return ",".join(v)
        return str(v) if v else "http://localhost:3000"

    def get_allowed_origins(self) -> List[str]:
        """Return ALLOWED_ORIGINS as a list, parsing JSON or comma-separated."""
        import json
        raw = self.ALLOWED_ORIGINS.strip()
        if not raw:
            return ["http://localhost:3000"]
        # Try JSON array first
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [o.strip() for o in parsed if o.strip()]
        except (json.JSONDecodeError, ValueError):
            pass
        # Fallback: comma-separated
        return [o.strip() for o in raw.split(",") if o.strip()]

    @property
    def cashfree_base_url(self) -> str:
        if self.CASHFREE_ENV == "production":
            return "https://api.cashfree.com/pg"
        return "https://sandbox.cashfree.com/pg"


def get_settings() -> Settings:
    return Settings()


settings = get_settings()
