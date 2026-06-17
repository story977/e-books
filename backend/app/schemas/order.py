from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime
from app.models import PyObjectId


class CreateOrderRequest(BaseModel):
    book_id: str = Field(..., description="MongoDB book _id")
    buyer_name: str = Field(..., min_length=2, max_length=100)
    buyer_email: EmailStr
    buyer_phone: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")


class VerifyPaymentRequest(BaseModel):
    cashfree_order_id: str
    cashfree_payment_id: str
    cashfree_signature: str


class OrderInDB(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    book_id: str
    buyer_name: str
    buyer_email: str
    buyer_phone: str
    amount: float
    payment_status: Literal["PENDING", "SUCCESS", "FAILED", "CANCELLED"] = "PENDING"
    cashfree_order_id: Optional[str] = None
    transaction_id: Optional[str] = None
    download_token: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"populate_by_name": True}


class OrderResponse(BaseModel):
    id: str
    book_id: str
    buyer_name: str
    buyer_email: str
    amount: float
    payment_status: str
    cashfree_order_id: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: datetime


class CreateOrderResponse(BaseModel):
    cashfree_order_id: str
    payment_session_id: str
    amount: float
    book_title: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    download_token: Optional[str] = None
    message: str
