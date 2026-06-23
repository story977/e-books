from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models import PyObjectId


class BookBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=10, max_length=5000)
    price: float = Field(..., gt=0, le=100000)
    category: str = Field(..., min_length=1, max_length=50)


class BookCreate(BookBase):
    """Schema for creating a new book (multipart form handled in router)."""
    pass


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    price: Optional[float] = Field(None, gt=0, le=100000)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    cover_url: Optional[str] = None
    pdf_url: Optional[str] = None


class BookInDB(BookBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    slug: str
    cover_url: str
    pdf_public_id: str  # Cloudinary public ID (private, not a public URL)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"populate_by_name": True}


class BookResponse(BaseModel):
    """Public-facing book response (no pdf_public_id exposed)."""
    id: str
    title: str
    author: str
    description: str
    price: float
    category: str
    slug: str
    cover_url: str
    hard_copy_url: Optional[str] = None
    created_at: datetime
    rating: Optional[float] = None  # average star rating (1.0–5.0), None if unrated
    rating_count: int = 0            # total number of ratings

    model_config = {"from_attributes": True}


class BookListResponse(BaseModel):
    books: list[BookResponse]
    total: int
    page: int
    limit: int
    has_next: bool
