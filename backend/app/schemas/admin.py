from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class SalesStats(BaseModel):
    total_revenue: float
    total_orders: int
    successful_orders: int
    pending_orders: int
    failed_orders: int
    total_books: int
    recent_orders: list
