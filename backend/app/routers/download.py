"""Download router — validates token and redirects to signed Cloudinary URL."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from bson import ObjectId
import logging

from app.database import get_books_collection, get_orders_collection
from app.services.download_token import verify_download_token
from app.services.cloudinary_service import generate_signed_pdf_url
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{token}")
async def download_book(token: str):
    """Validate download token and redirect to time-limited Cloudinary URL.
    
    Security:
    - JWT token must be valid and unexpired (10 min window)
    - Token must have type='download' claim
    - Order must exist and be in SUCCESS state
    - Cloudinary signed URL expires in 10 minutes (same as token)
    """
    # Verify JWT token
    payload = verify_download_token(token)
    book_id = payload["book_id"]
    order_id = payload["order_id"]

    # Verify order is actually paid (prevent token reuse from cancelled orders)
    orders_col = get_orders_collection()
    if ObjectId.is_valid(order_id):
        order = await orders_col.find_one({"_id": ObjectId(order_id)})
        if not order or order.get("payment_status") != "SUCCESS":
            raise HTTPException(403, "Order not found or payment not completed")

    # Get book PDF public_id
    books_col = get_books_collection()
    if not ObjectId.is_valid(book_id):
        raise HTTPException(400, "Invalid book reference")

    book = await books_col.find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(404, "Book not found")

    # Generate 10-minute signed Cloudinary URL
    signed_url = generate_signed_pdf_url(
        pdf_public_id=book["pdf_public_id"],
        expires_in=settings.DOWNLOAD_TOKEN_EXPIRE_MINUTES * 60,
    )

    logger.info(f"Download initiated: book={book['title']}, order={order_id}")

    # Redirect to signed URL — browser downloads directly from Cloudinary CDN
    return RedirectResponse(url=signed_url, status_code=302)
