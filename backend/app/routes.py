from fastapi import APIRouter, Query
from app.scrapper import fetch_latest_results
from app.database import collection
from app.models import LotteryResult
from datetime import datetime
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