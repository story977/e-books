from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


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

    # CORS — comma-separated origins
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # URLs
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def cashfree_base_url(self) -> str:
        if self.CASHFREE_ENV == "production":
            return "https://api.cashfree.com/pg"
        return "https://sandbox.cashfree.com/pg"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
