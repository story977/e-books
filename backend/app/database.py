from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, db
    logger.info("Connecting to MongoDB...")
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        maxPoolSize=10,
    )
    db = client[settings.DATABASE_NAME]
    # Ping to verify connection
    await client.admin.command("ping")
    logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")

    # Create indexes
    await _create_indexes()


async def _create_indexes() -> None:
    """Create MongoDB indexes for performance and uniqueness."""
    # Books indexes
    await db["books"].create_index("slug", unique=True)
    await db["books"].create_index("category")
    await db["books"].create_index("created_at")
    await db["books"].create_index([("title", "text"), ("description", "text"), ("author", "text")])

    # Orders indexes
    await db["orders"].create_index("cashfree_order_id", unique=True, sparse=True)
    await db["orders"].create_index("buyer_email")
    await db["orders"].create_index("payment_status")
    await db["orders"].create_index("created_at")

    # Download tokens index (TTL — auto-expire after 10 min)
    await db["download_tokens"].create_index("created_at", expireAfterSeconds=600)

    logger.info("MongoDB indexes created successfully")


async def close_mongo_connection() -> None:
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db


def get_books_collection():
    return get_database()["books"]


def get_orders_collection():
    return get_database()["orders"]


def get_tokens_collection():
    return get_database()["download_tokens"]


def get_contacts_collection():
    return get_database()["contacts"]
