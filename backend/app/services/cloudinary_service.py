import cloudinary
import cloudinary.uploader
import cloudinary.utils
from fastapi import UploadFile, HTTPException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_PDF_TYPES = {"application/pdf"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024   # 5 MB
MAX_PDF_SIZE = 100 * 1024 * 1024   # 100 MB


async def upload_cover_image(file: UploadFile, book_slug: str) -> str:
    """Upload book cover to Cloudinary (public delivery). Returns secure URL."""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Cover must be JPEG, PNG, or WebP")

    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(400, "Cover image must be under 5 MB")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="ebook-store/covers",
            public_id=f"cover_{book_slug}",
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 1100, "crop": "fill", "gravity": "center"},
                {"quality": "auto", "fetch_format": "auto"},
            ],
        )
        return result["secure_url"]
    except Exception as e:
        logger.error(f"Failed to upload cover image: {e}")
        raise HTTPException(500, "Failed to upload cover image")


async def upload_pdf(file: UploadFile, book_slug: str) -> str:
    """Upload PDF to Cloudinary with private access. Returns public_id (NOT a URL)."""
    if file.content_type not in ALLOWED_PDF_TYPES:
        raise HTTPException(400, "File must be a PDF")

    contents = await file.read()
    if len(contents) > MAX_PDF_SIZE:
        raise HTTPException(400, "PDF must be under 100 MB")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="ebook-store/pdfs",
            public_id=f"pdf_{book_slug}",
            overwrite=True,
            resource_type="raw",
            type="private",  # Critical: private delivery — not publicly accessible
        )
        return result["public_id"]  # Store only the public_id, never the URL
    except Exception as e:
        logger.error(f"Failed to upload PDF: {e}")
        raise HTTPException(500, "Failed to upload PDF")


def generate_signed_pdf_url(pdf_public_id: str, expires_in: int = 600) -> str:
    """Generate a time-limited signed URL for private PDF delivery.
    
    Args:
        pdf_public_id: Cloudinary public_id of the private PDF
        expires_in: URL expiry in seconds (default 600 = 10 minutes)
    
    Returns:
        Signed URL valid for `expires_in` seconds
    """
    import time
    expiry_timestamp = int(time.time()) + expires_in

    signed_url, _ = cloudinary.utils.cloudinary_url(
        pdf_public_id,
        resource_type="raw",
        type="private",
        sign_url=True,
        expires_at=expiry_timestamp,
        secure=True,
    )
    return signed_url


async def delete_cloudinary_asset(public_id: str, resource_type: str = "image") -> None:
    """Delete an asset from Cloudinary."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)
    except Exception as e:
        logger.warning(f"Failed to delete Cloudinary asset {public_id}: {e}")
