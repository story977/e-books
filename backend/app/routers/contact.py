from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone
import logging

from app.database import get_contacts_collection
from app.schemas.contact import ContactMessageCreate, ContactMessageResponse, ContactMessageListResponse
from app.middleware.auth import verify_admin_token

router = APIRouter()
logger = logging.getLogger(__name__)


def message_doc_to_response(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "subject": doc["subject"],
        "message": doc["message"],
        "is_read": doc.get("is_read", False),
        "created_at": doc["created_at"],
    }


@router.post("", response_model=dict, status_code=201)
async def create_contact_message(body: ContactMessageCreate):
    """Submit a new contact message."""
    collection = get_contacts_collection()
    
    now = datetime.now(timezone.utc)
    doc = {
        "name": body.name,
        "email": body.email,
        "subject": body.subject,
        "message": body.message,
        "is_read": False,
        "created_at": now,
    }
    
    await collection.insert_one(doc)
    logger.info(f"New contact message from {body.email}")
    
    return {"success": True, "message": "Message received successfully"}


@router.get("", response_model=ContactMessageListResponse)
async def list_contact_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    _: dict = Depends(verify_admin_token),
):
    """List all contact messages for admin."""
    collection = get_contacts_collection()
    
    skip = (page - 1) * limit
    total = await collection.count_documents({})
    
    cursor = collection.find({}).sort("created_at", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=limit)
    
    return ContactMessageListResponse(
        messages=[ContactMessageResponse(**message_doc_to_response(m)) for m in messages],
        total=total,
        page=page,
        limit=limit,
    )


@router.put("/{message_id}/read", response_model=ContactMessageResponse)
async def mark_message_read(
    message_id: str,
    _: dict = Depends(verify_admin_token),
):
    """Mark a contact message as read. Admin only."""
    if not ObjectId.is_valid(message_id):
        raise HTTPException(400, "Invalid message ID")
        
    collection = get_contacts_collection()
    
    result = await collection.update_one(
        {"_id": ObjectId(message_id)},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(404, "Message not found")
        
    doc = await collection.find_one({"_id": ObjectId(message_id)})
    return ContactMessageResponse(**message_doc_to_response(doc))
