"""Payment router — create Cashfree order and verify payment."""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from bson import ObjectId
from datetime import datetime, timezone
import logging

from app.database import get_books_collection, get_orders_collection
from app.schemas.order import CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest, VerifyPaymentResponse
from app.services.cashfree_service import create_cashfree_order, get_order_status
from app.services.download_token import generate_download_token
from app.utils.security import generate_order_id
from app.config import settings

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)


@router.post("/create-order", response_model=CreateOrderResponse)
@limiter.limit("10/minute")
async def create_order(request: Request, body: CreateOrderRequest):
    """Initiate a payment order via Cashfree.
    
    Flow:
    1. Validate book exists
    2. Create pending order in DB
    3. Create Cashfree order
    4. Update DB with Cashfree order ID
    5. Return payment_session_id for frontend SDK
    """
    # Validate book
    if not ObjectId.is_valid(body.book_id):
        raise HTTPException(400, "Invalid book ID")

    books_col = get_books_collection()
    orders_col = get_orders_collection()

    book = await books_col.find_one({"_id": ObjectId(body.book_id)})
    if not book:
        raise HTTPException(404, "Book not found")

    # Generate unique order ID
    order_id = generate_order_id(body.book_id)

    # Save pending order to DB first
    now = datetime.now(timezone.utc)
    order_doc = {
        "book_id": body.book_id,
        "buyer_name": body.buyer_name,
        "buyer_email": body.buyer_email,
        "buyer_phone": body.buyer_phone,
        "amount": book["price"],
        "payment_status": "PENDING",
        "cashfree_order_id": None,
        "transaction_id": None,
        "download_token": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await orders_col.insert_one(order_doc)
    db_order_id = str(result.inserted_id)

    # Create Cashfree order
    return_url = f"{settings.FRONTEND_URL}/payment-success"
    try:
        cf_result = await create_cashfree_order(
            order_id=order_id,
            amount=book["price"],
            buyer_name=body.buyer_name,
            buyer_email=body.buyer_email,
            buyer_phone=body.buyer_phone,
            return_url=return_url,
        )
    except Exception as e:
        # Clean up pending order if Cashfree fails
        await orders_col.delete_one({"_id": result.inserted_id})
        raise

    # Update order with Cashfree order ID
    await orders_col.update_one(
        {"_id": result.inserted_id},
        {"$set": {
            "cashfree_order_id": cf_result["cf_order_id"],
            "internal_order_id": order_id,
            "updated_at": datetime.now(timezone.utc),
        }},
    )

    logger.info(f"Payment order created: {order_id} for book {book['title']}")

    return CreateOrderResponse(
        cashfree_order_id=cf_result["cf_order_id"],
        payment_session_id=cf_result["payment_session_id"],
        amount=book["price"],
        book_title=book["title"],
    )


@router.post("/verify", response_model=VerifyPaymentResponse)
@limiter.limit("20/minute")
async def verify_payment(request: Request, body: VerifyPaymentRequest):
    """Verify payment and generate secure download token.
    
    Flow:
    1. Find order by Cashfree order ID
    2. Fetch payment status from Cashfree API
    3. If SUCCESS: generate download token, update order
    4. Return download token
    """
    orders_col = get_orders_collection()

    order = await orders_col.find_one({"cashfree_order_id": body.cashfree_order_id})
    if not order:
        raise HTTPException(404, "Order not found")

    # Prevent re-processing
    if order["payment_status"] == "SUCCESS":
        return VerifyPaymentResponse(
            success=True,
            download_token=order.get("download_token"),
            message="Payment already verified",
        )

    # Fetch real-time status from Cashfree
    cf_status = await get_order_status(body.cashfree_order_id)
    payment_status = cf_status.get("order_status", "FAILED").upper()

    if payment_status == "PAID":
        # Generate secure download token
        download_token = generate_download_token(
            book_id=order["book_id"],
            order_id=str(order["_id"]),
        )

        await orders_col.update_one(
            {"_id": order["_id"]},
            {"$set": {
                "payment_status": "SUCCESS",
                "transaction_id": body.cashfree_payment_id,
                "download_token": download_token,
                "updated_at": datetime.now(timezone.utc),
            }},
        )

        logger.info(f"Payment verified: {body.cashfree_order_id}")
        return VerifyPaymentResponse(
            success=True,
            download_token=download_token,
            message="Payment successful! Your download link is ready.",
        )
    else:
        await orders_col.update_one(
            {"_id": order["_id"]},
            {"$set": {
                "payment_status": payment_status,
                "updated_at": datetime.now(timezone.utc),
            }},
        )
        return VerifyPaymentResponse(
            success=False,
            message=f"Payment {payment_status.lower()}. Please try again.",
        )
