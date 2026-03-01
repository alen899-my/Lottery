from fastapi import APIRouter, Query
from app.scrapper import fetch_latest_results
from app.india_lottery_api import fetch_api_latest
from app.database import collection
from app.models import LotteryResult
from datetime import datetime
import pytz
router = APIRouter()

@router.get("/scrape-now")
async def trigger_scrape():
    data = await fetch_latest_results()
    if data:
        # Ensure iso_date is present
        if "iso_date" not in data:
            data["iso_date"] = datetime.now()

        # Save to MongoDB
        await collection.update_one(
            {"code": data["code"]}, 
            {"$set": data}, 
            upsert=True
        )
        return {"message": "Success", "data": data}
    return {"message": "Failed to fetch"}

@router.get("/scrape-live")
async def trigger_live_scrape():
    """Fetches live results from IndiaLotteryAPI"""
    result = await fetch_api_latest()
    if result.get("status") == "success":
        data = result["data"]
        # Save to MongoDB
        await collection.update_one(
            {"code": data["code"]}, 
            {"$set": data}, 
            upsert=True
        )
        return {"message": "Live Success", "data": data}
    return {"message": "Failed to fetch live data", "details": result}

@router.get("/cron/daily-scrape")
async def cron_daily_scrape():
    """
    Triggered by Vercel Cron.
    Checks if today's results exist. If not, it scrapes.
    If it finds today's results, it stops trying for the day.
    """
    ist = pytz.timezone('Asia/Kolkata')
    today_str = datetime.now(ist).strftime("%d/%m/%Y")
    
    print(f"🕒 [{datetime.now(ist).strftime('%H:%M:%S')}] Cron job running for {today_str}...")

    # 1. CONTINUE SCRAPING: We no longer stop if data exists, so live data updates can flow in
    # existing = await collection.find_one({"draw_date": today_str})
    # if existing:
    #     # print(f"✅ SUCCESS: Results for {today_str} already exist in DB. Skipping task.")
    #     # return

    # 2. ATTEMPT INDIA LOTTERY API
    print(f"📡 Trying India Lottery API for {today_str}...")
    live_result = await fetch_api_latest()
    
    if live_result.get("status") == "success":
        live_data = live_result["data"]
        # Only save if the API date matches today
        if live_data and live_data.get("draw_date") == today_str:
            await collection.update_one(
                {"code": live_data["code"]}, 
                {"$set": live_data}, 
                upsert=True
            )
            msg = f"⚡ API UPDATE: Fetched and saved results for {today_str}."
            print(msg)
            return {"status": "success", "message": msg, "source": "API"}

    # --- OFFICIAL PDF FALLBACK (If API not ready) ---
    print(f"⚠️ API not ready for {today_str}. Trying Official PDF fallback...")
    data = await fetch_latest_results()
    
    # 3. DATE VERIFICATION: Only save if the scraped PDF date matches today
    if data and data.get("draw_date") == today_str:
        # Try to save to MongoDB
        await collection.update_one(
            {"code": data["code"]}, 
            {"$set": data}, 
            upsert=True
        )
        msg = f"🚀 OFFICIAL PDF: Saved provisional results for {today_str}."
        print(msg)
        return {"status": "success", "message": msg, "source": "PDF"}
            
    msg = f"⏳ NOT READY: Neither API nor Official PDF results available for {today_str} yet."
    print(msg)
    return {"status": "pending", "message": msg}

@router.get("/results")
async def get_all_results(name: str = Query(None)):
    query = {}
    if name:
        # This uses a Regular Expression to make the search case-insensitive
        query = {"name": {"$regex": f"^{name}$", "$options": "i"}}
    
    # --- FIX: Sort by 'iso_date' instead of 'draw_date' ---
    # -1 means Descending (Newest dates first)
    results = await collection.find(query).sort("iso_date", -1).to_list(100)
    
    for r in results: 
        r["_id"] = str(r["_id"])
    return results
@router.get("/results/{code}")
async def get_result_by_code(code: str):
    """Fetch a specific lottery result by its code"""
    result = await collection.find_one({"code": code})
    if result:
        result["_id"] = str(result["_id"])
        return result
    return {"error": "Result not found"}

@router.get("/lottery-types")
async def get_lottery_types():
    # This finds every unique "name" in your database automatically
    types = await collection.distinct("name")
    return types

@router.get("/fix-database-dates")
async def fix_database_dates():
    all_results = await collection.find({}).to_list(None)
    count = 0
    
    for result in all_results:
        if "draw_date" in result:
            try:
                # --- FIX: Changed '-' to '/' below ---
                real_date = datetime.strptime(result["draw_date"], "%d/%m/%Y")
                
                await collection.update_one(
                    {"_id": result["_id"]},
                    {"$set": {"iso_date": real_date}}
                )
                count += 1
            except Exception as e:
                print(f"Skipping {result.get('code')}: {e}")
                
    return {"message": f"Successfully updated {count} records."}