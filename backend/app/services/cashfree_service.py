import hashlib
import hmac
import httpx
from fastapi import HTTPException
from app.config import settings
import logging

logger = logging.getLogger(__name__)

CASHFREE_API_VERSION = "2023-08-01"


def _get_headers() -> dict:
    return {
        "x-api-version": CASHFREE_API_VERSION,
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "Content-Type": "application/json",
    }


async def create_cashfree_order(
    order_id: str,
    amount: float,
    buyer_name: str,
    buyer_email: str,
    buyer_phone: str,
    return_url: str,
) -> dict:
    """Create a Cashfree payment order.
    
    Returns dict with:
        - cf_order_id: Cashfree's order ID
        - payment_session_id: used by frontend SDK
    """
    payload = {
        "order_id": order_id,
        "order_amount": round(amount, 2),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"cust_{order_id}",
            "customer_name": buyer_name,
            "customer_email": buyer_email,
            "customer_phone": buyer_phone,
        },
        "order_meta": {
            "return_url": f"{return_url}?order_id={{order_id}}",
            "notify_url": f"{settings.APP_URL}/webhook/cashfree",
        },
        "order_expiry_time": _get_order_expiry(),
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.cashfree_base_url}/orders",
                headers=_get_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return {
                "cf_order_id": data["cf_order_id"],
                "payment_session_id": data["payment_session_id"],
            }
    except httpx.HTTPStatusError as e:
        logger.error(f"Cashfree create order failed: {e.response.text}")
        raise HTTPException(502, f"Payment gateway error: {e.response.text}")
    except Exception as e:
        logger.error(f"Cashfree request failed: {e}")
        raise HTTPException(502, "Payment gateway unavailable")


async def get_order_status(cf_order_id: str) -> dict:
    """Fetch payment status from Cashfree for a given order ID."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{settings.cashfree_base_url}/orders/{cf_order_id}",
                headers=_get_headers(),
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"Cashfree status check failed: {e.response.text}")
        raise HTTPException(502, "Failed to verify payment status")


def verify_webhook_signature(raw_body: bytes, received_signature: str) -> bool:
    """Verify Cashfree webhook HMAC-SHA256 signature.
    
    Cashfree signs: timestamp.rawBody using SECRET_KEY
    """
    try:
        computed = hmac.new(
            settings.CASHFREE_SECRET_KEY.encode("utf-8"),
            raw_body,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(computed, received_signature)
    except Exception as e:
        logger.error(f"Webhook signature verification error: {e}")
        return False


def _get_order_expiry() -> str:
    """Return ISO 8601 timestamp 30 minutes from now."""
    from datetime import datetime, timezone, timedelta
    expiry = datetime.now(timezone.utc) + timedelta(minutes=30)
    return expiry.strftime("%Y-%m-%dT%H:%M:%S+05:30")
