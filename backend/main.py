from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import pytz
import os
from app.routes import router
from app.scrapper import fetch_latest_results
from app.database import collection

load_dotenv()
# --- SCHEDULER LOGIC ---
async def daily_scrape_job():
    """
    Starts at 3:00 PM IST. 
    Checks if today's results exist. If not, it scrapes.
    If it finds today's results, it stops trying for the day.
    """
    ist = pytz.timezone('Asia/Kolkata')
    today_str = datetime.now(ist).strftime("%d/%m/%Y")
    
    print(f"🕒 [{datetime.now(ist).strftime('%H:%M:%S')}] Checking results for {today_str}...")

    # 1. STOP IF ALREADY SUCCESSFUL: Check if today's data is already in MongoDB
    existing = await collection.find_one({"draw_date": today_str})
    if existing:
        print(f"✅ SUCCESS: Results for {today_str} already exist in DB. Skipping task.")
        return

    # 2. ATTEMPT SCRAPE: If results not found in DB
    data = await fetch_latest_results()
    
    # 3. DATE VERIFICATION: Only save if the scraped PDF date matches today
    if data and data.get("draw_date") == today_str:
        await collection.update_one(
            {"code": data["code"]}, 
            {"$set": data}, 
            upsert=True
        )
        print(f"🚀 MISSION COMPLETE: Fetched and saved results for {today_str}.")
    else:
        print(f"⏳ NOT READY: Results for {today_str} not available on site yet. Retrying in 5 mins.")

# --- APP LIFESPAN (Starts with FastAPI) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Scheduler with IST timezone
    scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")
    
    # CRON TRIGGER: Run every 5 minutes (0, 5, 10... 55) during the 15th hour (3 PM)
    # This automatically stops at 4:00 PM.
    trigger = CronTrigger(hour="15", minute="0-59/5", timezone="Asia/Kolkata")
    
    scheduler.add_job(daily_scrape_job, trigger)
    scheduler.start()
    
    print("📅 Scheduler Active: Monitoring Kerala Lottery (3:00 PM - 4:00 PM IST)")
    yield
    scheduler.shutdown()

# --- FASTAPI SETUP ---
app = FastAPI(title="Kerala Lottery API", lifespan=lifespan)

# 2. DYNAMIC CORS CONFIGURATION
# This pulls the URL from your .env file or defaults to localhost
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url], 
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # 3. DYNAMIC PORT SELECTION
    # Most deployment platforms (like Render/Railway) assign a port via environment variable
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)