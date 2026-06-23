"""Books router — public read endpoints + admin CRUD."""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Query
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
import logging

from app.database import get_books_collection
from app.schemas.book import BookResponse, BookListResponse, BookUpdate
from app.services.cloudinary_service import upload_cover_image, upload_pdf, delete_cloudinary_asset
from app.middleware.auth import verify_admin_token
from app.utils.security import slugify

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

VALID_CATEGORIES = [
    "Programming", "Self-Help", "Business", "Science", "Fiction",
    "Non-Fiction", "Design", "Marketing", "Finance", "Health", "Other"
]


def book_doc_to_response(doc: dict) -> dict:
    """Convert MongoDB document to BookResponse-compatible dict."""
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "author": doc["author"],
        "description": doc["description"],
        "price": doc["price"],
        "category": doc["category"],
        "slug": doc["slug"],
        "cover_url": doc["cover_url"],
        "created_at": doc["created_at"],
        "rating": doc.get("rating"),
        "rating_count": doc.get("rating_count", 0),
    }


@router.get("", response_model=BookListResponse)
@limiter.limit("60/minute")
async def list_books(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None, max_length=100),
    sort: str = Query("created_at", pattern="^(created_at|price|title)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
):
    """List books with pagination, category filter, and full-text search."""
    collection = get_books_collection()
    query: dict = {}

    if category:
        query["category"] = category
    if search:
        query["$text"] = {"$search": search}

    sort_dir = -1 if order == "desc" else 1
    skip = (page - 1) * limit

    total = await collection.count_documents(query)
    cursor = collection.find(query).sort(sort, sort_dir).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)

    return BookListResponse(
        books=[BookResponse(**book_doc_to_response(b)) for b in books],
        total=total,
        page=page,
        limit=limit,
        has_next=(skip + limit) < total,
    )


@router.get("/{slug_or_id}", response_model=BookResponse)
@limiter.limit("120/minute")
async def get_book(request: Request, slug_or_id: str):
    """Get a single book by slug (SEO URL) or MongoDB _id."""
    collection = get_books_collection()
    query = {}

    if ObjectId.is_valid(slug_or_id):
        query["_id"] = ObjectId(slug_or_id)
    else:
        query["slug"] = slug_or_id

    doc = await collection.find_one(query)
    if not doc:
        raise HTTPException(404, "Book not found")

    return BookResponse(**book_doc_to_response(doc))


@router.post("", response_model=BookResponse, status_code=201)
@limiter.limit("20/minute")
async def create_book(
    request: Request,
    title: str = Form(..., min_length=1, max_length=200),
    author: str = Form(..., min_length=1, max_length=100),
    description: str = Form(..., min_length=10, max_length=5000),
    price: float = Form(..., gt=0, le=100000),
    category: str = Form(...),
    cover_image: UploadFile = File(...),
    pdf_file: UploadFile = File(...),
    _: dict = Depends(verify_admin_token),
):
    """Create a new book with cover image and PDF upload. Admin only."""
    if category not in VALID_CATEGORIES:
        raise HTTPException(400, f"Category must be one of: {', '.join(VALID_CATEGORIES)}")

    collection = get_books_collection()
    slug = slugify(title)

    # Ensure unique slug
    existing = await collection.find_one({"slug": slug})
    if existing:
        import uuid
        slug = f"{slug}-{str(uuid.uuid4())[:6]}"

    # Upload files to Cloudinary
    cover_url = await upload_cover_image(cover_image, slug)
    pdf_public_id = await upload_pdf(pdf_file, slug)

    now = datetime.now(timezone.utc)
    doc = {
        "title": title,
        "author": author,
        "description": description,
        "price": price,
        "category": category,
        "slug": slug,
        "cover_url": cover_url,
        "pdf_public_id": pdf_public_id,
        "created_at": now,
        "updated_at": now,
    }

    result = await collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    logger.info(f"Book created: {title} (slug: {slug})")

    return BookResponse(**book_doc_to_response(doc))


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    cover_image: Optional[UploadFile] = File(None),
    pdf_file: Optional[UploadFile] = File(None),
    _: dict = Depends(verify_admin_token),
):
    """Update a book. Admin only. Only provided fields are updated."""
    if not ObjectId.is_valid(book_id):
        raise HTTPException(400, "Invalid book ID")

    collection = get_books_collection()
    existing = await collection.find_one({"_id": ObjectId(book_id)})
    if not existing:
        raise HTTPException(404, "Book not found")

    updates: dict = {"updated_at": datetime.now(timezone.utc)}

    if title:
        updates["title"] = title
    if author:
        updates["author"] = author
    if description:
        updates["description"] = description
    if price is not None:
        updates["price"] = price
    if category:
        if category not in VALID_CATEGORIES:
            raise HTTPException(400, f"Invalid category")
        updates["category"] = category

    slug = existing["slug"]

    if cover_image and cover_image.filename:
        updates["cover_url"] = await upload_cover_image(cover_image, slug)
    if pdf_file and pdf_file.filename:
        updates["pdf_public_id"] = await upload_pdf(pdf_file, slug)

    await collection.update_one({"_id": ObjectId(book_id)}, {"$set": updates})
    updated = await collection.find_one({"_id": ObjectId(book_id)})
    logger.info(f"Book updated: {book_id}")

    return BookResponse(**book_doc_to_response(updated))


@router.delete("/{book_id}", status_code=204)
async def delete_book(
    book_id: str,
    _: dict = Depends(verify_admin_token),
):
    """Delete a book and its Cloudinary assets. Admin only."""
    if not ObjectId.is_valid(book_id):
        raise HTTPException(400, "Invalid book ID")

    collection = get_books_collection()
    doc = await collection.find_one({"_id": ObjectId(book_id)})
    if not doc:
        raise HTTPException(404, "Book not found")

    # Clean up Cloudinary assets
    await delete_cloudinary_asset(f"ebook-store/covers/cover_{doc['slug']}", "image")
    await delete_cloudinary_asset(doc["pdf_public_id"], "raw")

    await collection.delete_one({"_id": ObjectId(book_id)})
    logger.info(f"Book deleted: {book_id}")
