"""Ratings router — submit, fetch, and broadcast book ratings via WebSocket."""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
import logging
import json
import asyncio

from app.database import get_ratings_collection, get_books_collection, get_orders_collection
from app.services.download_token import verify_download_token

router = APIRouter()
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# WebSocket connection manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    """Tracks active WebSocket connections per book_id."""

    def __init__(self):
        # book_id -> list of WebSocket connections
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, book_id: str, ws: WebSocket):
        await ws.accept()
        self.active.setdefault(book_id, []).append(ws)
        logger.info(f"WS connected: book={book_id}, total={len(self.active[book_id])}")

    def disconnect(self, book_id: str, ws: WebSocket):
        if book_id in self.active:
            self.active[book_id] = [c for c in self.active[book_id] if c is not ws]
        logger.info(f"WS disconnected: book={book_id}")

    async def broadcast(self, book_id: str, data: dict):
        """Send JSON payload to all subscribers of a book."""
        connections = self.active.get(book_id, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(book_id, ws)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class RatingSubmitRequest(BaseModel):
    book_id: str
    rating: int = Field(..., ge=1, le=5)
    download_token: str


class RatingResponse(BaseModel):
    book_id: str
    average: Optional[float]
    count: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/{book_id}", response_model=RatingResponse)
async def get_rating(book_id: str):
    """Get the current average rating for a book."""
    books_col = get_books_collection()

    if not ObjectId.is_valid(book_id):
        # Allow slug lookup
        book = await books_col.find_one({"slug": book_id})
        if not book:
            raise HTTPException(404, "Book not found")
        book_id = str(book["_id"])
    else:
        book = await books_col.find_one({"_id": ObjectId(book_id)})
        if not book:
            raise HTTPException(404, "Book not found")

    return RatingResponse(
        book_id=book_id,
        average=book.get("rating"),
        count=book.get("rating_count", 0),
    )


@router.post("", response_model=RatingResponse, status_code=201)
async def submit_rating(body: RatingSubmitRequest):
    """Submit a rating for a book.

    Security:
    - download_token JWT must be valid (not expired) and contain book_id + order_id
    - Order must be SUCCESS
    - One rating per order (duplicate rejected with 409)
    """
    # 1. Verify download token
    try:
        token_payload = verify_download_token(body.download_token)
    except HTTPException:
        raise HTTPException(401, "Invalid or expired download token. Rate within 10 minutes of purchase.")

    token_book_id = token_payload["book_id"]
    order_id = token_payload["order_id"]

    # 2. Ensure the book_id in request matches the token
    if body.book_id != token_book_id:
        raise HTTPException(403, "Token book_id mismatch")

    # 3. Verify order is SUCCESS
    orders_col = get_orders_collection()
    if ObjectId.is_valid(order_id):
        order = await orders_col.find_one({"_id": ObjectId(order_id)})
        if not order or order.get("payment_status") != "SUCCESS":
            raise HTTPException(403, "Order not found or not completed")

    # 4. Check for duplicate rating
    ratings_col = get_ratings_collection()
    existing = await ratings_col.find_one({"book_id": body.book_id, "order_id": order_id})
    if existing:
        raise HTTPException(409, "You have already rated this book")

    # 5. Save rating
    now = datetime.now(timezone.utc)
    await ratings_col.insert_one({
        "book_id": body.book_id,
        "order_id": order_id,
        "rating": body.rating,
        "created_at": now,
    })

    # 6. Recompute average and update book document (denormalized)
    pipeline = [
        {"$match": {"book_id": body.book_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    cursor = ratings_col.aggregate(pipeline)
    agg = await cursor.to_list(length=1)

    if agg:
        new_avg = round(agg[0]["avg"], 2)
        new_count = agg[0]["count"]
    else:
        new_avg = float(body.rating)
        new_count = 1

    books_col = get_books_collection()
    await books_col.update_one(
        {"_id": ObjectId(body.book_id)},
        {"$set": {"rating": new_avg, "rating_count": new_count, "updated_at": now}},
    )

    logger.info(f"Rating submitted: book={body.book_id}, stars={body.rating}, avg={new_avg}")

    # 7. Broadcast updated rating to all WebSocket subscribers
    await manager.broadcast(body.book_id, {
        "type": "rating_update",
        "book_id": body.book_id,
        "average": new_avg,
        "count": new_count,
    })

    return RatingResponse(book_id=body.book_id, average=new_avg, count=new_count)


@router.websocket("/ws/{book_id}")
async def ratings_websocket(ws: WebSocket, book_id: str):
    """WebSocket endpoint — clients subscribe to real-time rating updates for a book."""
    await manager.connect(book_id, ws)
    try:
        # Send current rating on connect
        books_col = get_books_collection()
        book = await books_col.find_one({"_id": ObjectId(book_id)}) if ObjectId.is_valid(book_id) else None
        if book:
            await ws.send_json({
                "type": "rating_init",
                "book_id": book_id,
                "average": book.get("rating"),
                "count": book.get("rating_count", 0),
            })

        # Keep alive — wait for client disconnect
        while True:
            # Receive any message (ping/pong) to detect disconnect
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")

    except WebSocketDisconnect:
        manager.disconnect(book_id, ws)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(book_id, ws)
