"""Admin router — login, order management, and sales dashboard."""

from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone
import logging

from app.database import get_orders_collection, get_books_collection
from app.schemas.admin import AdminLoginRequest, AdminTokenResponse, SalesStats
from app.middleware.auth import verify_admin_token
from app.utils.security import verify_password, create_admin_token
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(body: AdminLoginRequest):
    """Authenticate admin with username + password. Returns JWT."""
    if body.username != settings.ADMIN_USERNAME:
        raise HTTPException(401, "Invalid credentials")

    if not settings.ADMIN_PASSWORD_HASH:
        raise HTTPException(500, "Admin password not configured")

    if not verify_password(body.password, settings.ADMIN_PASSWORD_HASH):
        raise HTTPException(401, "Invalid credentials")

    token = create_admin_token(body.username)
    logger.info(f"Admin login: {body.username}")

    return AdminTokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.get("/orders")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None, pattern="^(PENDING|SUCCESS|FAILED|CANCELLED)?$"),
    _: dict = Depends(verify_admin_token),
):
    """List all orders with pagination and optional status filter. Admin only."""
    orders_col = get_orders_collection()
    query: dict = {}
    if status:
        query["payment_status"] = status

    skip = (page - 1) * limit
    total = await orders_col.count_documents(query)
    cursor = orders_col.find(query).sort("created_at", -1).skip(skip).limit(limit)
    orders = await cursor.to_list(length=limit)

    # Enrich with book titles
    books_col = get_books_collection()
    enriched = []
    for order in orders:
        book = None
        if ObjectId.is_valid(order.get("book_id", "")):
            book = await books_col.find_one({"_id": ObjectId(order["book_id"])}, {"title": 1})
        enriched.append({
            "id": str(order["_id"]),
            "book_id": order["book_id"],
            "book_title": book["title"] if book else "Unknown",
            "buyer_name": order["buyer_name"],
            "buyer_email": order["buyer_email"],
            "amount": order["amount"],
            "payment_status": order["payment_status"],
            "cashfree_order_id": order.get("cashfree_order_id"),
            "transaction_id": order.get("transaction_id"),
            "created_at": order["created_at"].isoformat(),
        })

    return {"orders": enriched, "total": total, "page": page, "limit": limit}


@router.get("/sales", response_model=SalesStats)
async def get_sales_stats(_: dict = Depends(verify_admin_token)):
    """Aggregate sales statistics for admin dashboard. Admin only."""
    orders_col = get_orders_collection()
    books_col = get_books_collection()

    pipeline = [
        {"$group": {
            "_id": "$payment_status",
            "count": {"$sum": 1},
            "revenue": {"$sum": {"$cond": [{"$eq": ["$payment_status", "SUCCESS"]}, "$amount", 0]}},
        }}
    ]

    stats = {s["_id"]: s async for s in orders_col.aggregate(pipeline)}

    total_revenue = stats.get("SUCCESS", {}).get("revenue", 0)
    successful_orders = stats.get("SUCCESS", {}).get("count", 0)
    pending_orders = stats.get("PENDING", {}).get("count", 0)
    failed_orders = stats.get("FAILED", {}).get("count", 0) + stats.get("CANCELLED", {}).get("count", 0)
    total_orders = successful_orders + pending_orders + failed_orders
    total_books = await books_col.count_documents({})

    # Recent 5 orders
    recent_cursor = orders_col.find({"payment_status": "SUCCESS"}).sort("created_at", -1).limit(5)
    recent_orders_raw = await recent_cursor.to_list(length=5)
    recent_orders = []
    for o in recent_orders_raw:
        book = None
        if ObjectId.is_valid(o.get("book_id", "")):
            book = await books_col.find_one({"_id": ObjectId(o["book_id"])}, {"title": 1})
        recent_orders.append({
            "id": str(o["_id"]),
            "book_title": book["title"] if book else "Unknown",
            "buyer_name": o["buyer_name"],
            "amount": o["amount"],
            "created_at": o["created_at"].isoformat(),
        })

    return SalesStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        successful_orders=successful_orders,
        pending_orders=pending_orders,
        failed_orders=failed_orders,
        total_books=total_books,
        recent_orders=recent_orders,
    )
