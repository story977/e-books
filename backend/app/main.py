from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import books, payment, download, admin, webhook, contact, ratings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup and shutdown events."""
    await connect_to_mongo()
    logger.info("eBook Store API started successfully")
    yield
    await close_mongo_connection()
    logger.info("eBook Store API shutting down")


app = FastAPI(
    title="eBook Store API",
    description="Production-ready digital eBook selling platform",
    version="1.0.0",
    docs_url="/docs" if settings.CASHFREE_ENV == "sandbox" else None,
    redoc_url="/redoc" if settings.CASHFREE_ENV == "sandbox" else None,
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    max_age=3600,
)

# Include routers
app.include_router(books.router, prefix="/books", tags=["Books"])
app.include_router(payment.router, prefix="/payment", tags=["Payment"])
app.include_router(download.router, prefix="/download", tags=["Download"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(webhook.router, prefix="/webhook", tags=["Webhooks"])
app.include_router(contact.router, prefix="/contact", tags=["Contact"])
app.include_router(ratings.router, prefix="/ratings", tags=["Ratings"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/", tags=["Root"])
async def root():
    return {"message": "eBook Store API", "docs": "/docs"}
