import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Get the URI from environment variables
MONGO_URI = os.getenv("MONGO_URI")

# Safety Check: Ensure the URI exists before trying to connect
if not MONGO_URI:
    # Local fallback for development if .env is missing
    MONGO_URI = "mongodb://localhost:27017/lottery_db"
    print("⚠️ Warning: MONGO_URI not found in environment. Using local fallback.")

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("lottery_db")
collection = db.get_collection("results")