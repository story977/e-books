"""Cashfree webhook handler — verify signature and update order status."""

from fastapi import APIRouter, HTTPException, Request, Header
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional
import logging

from app.database import get_orders_collection
from app.services.cashfree_service import verify_webhook_signature
from app.services.download_token import generate_download_token

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/cashfree")
async def cashfree_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None),
    x_webhook_timestamp: Optional[str] = Header(None),
):
    """Handle Cashfree payment webhooks.
    
    Security:
    - Verifies HMAC-SHA256 signature from Cashfree
    - Idempotent — safe to receive duplicate events
    
    Cashfree sends events like:
    - PAYMENT_SUCCESS
    - PAYMENT_FAILED
    - PAYMENT_PENDING
    """
    raw_body = await request.body()

    if not x_webhook_signature:
        raise HTTPException(400, "Missing webhook signature")

    # Build the message Cashfree signs: timestamp + raw_body
    if x_webhook_timestamp:
        message = x_webhook_timestamp.encode() + raw_body
    else:
        message = raw_body

    if not verify_webhook_signature(message, x_webhook_signature):
        logger.warning("Webhook signature verification FAILED")
        raise HTTPException(401, "Invalid webhook signature")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "Invalid JSON payload")

    event_type = payload.get("type", "")
    data = payload.get("data", {})
    order_data = data.get("order", {})
    payment_data = data.get("payment", {})

    cf_order_id = order_data.get("order_id")
    if not cf_order_id:
        return {"status": "ignored", "reason": "no order_id"}

    orders_col = get_orders_collection()
    order = await orders_col.find_one({"cashfree_order_id": cf_order_id})
    if not order:
        logger.warning(f"Webhook: order not found for cf_order_id={cf_order_id}")
        return {"status": "ignored"}

    # Already processed
    if order.get("payment_status") == "SUCCESS":
        return {"status": "already_processed"}

    update: dict = {"updated_at": datetime.now(timezone.utc)}

    if event_type == "PAYMENT_SUCCESS_WEBHOOK":
        download_token = generate_download_token(
            book_id=order["book_id"],
            order_id=str(order["_id"]),
        )
        update.update({
            "payment_status": "SUCCESS",
            "transaction_id": payment_data.get("cf_payment_id"),
            "download_token": download_token,
        })
        logger.info(f"Webhook: payment SUCCESS for {cf_order_id}")

    elif event_type in ("PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"):
        update["payment_status"] = "FAILED"
        logger.info(f"Webhook: payment FAILED for {cf_order_id}")

    else:
        logger.info(f"Webhook: unhandled event type '{event_type}'")
        return {"status": "unhandled"}

    await orders_col.update_one({"_id": order["_id"]}, {"$set": update})
    return {"status": "ok"}
