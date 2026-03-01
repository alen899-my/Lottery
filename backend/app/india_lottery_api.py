import httpx
from datetime import datetime

BASE_API_URL = "https://indialotteryapi.com/wp-json/klr/v1"

def transform_api_response(api_data: dict) -> dict:
    """Transforms the India Lottery API response to match our LotteryResult format."""
    
    # Check if this is an error response
    if "code" in api_data and "message" in api_data:
        return None
        
    try:
        draw_date_str = api_data.get("draw_date", "")
        # Parse YYYY-MM-DD to DD/MM/YYYY
        iso_date = datetime.strptime(draw_date_str, "%Y-%m-%d")
        draw_date = iso_date.strftime("%d/%m/%Y")
        
        name = api_data.get("draw_name", "Unknown")
        code = api_data.get("draw_code", "Unknown")
        
        prizes = {}
        api_prizes = api_data.get("prizes", {})
        amounts = api_prizes.get("amounts", {})
        
        # 1. First Prize (Special format in India Lottery API)
        first_prize_data = api_data.get("first", {})
        # History format uses first_ticket
        if not first_prize_data and "first_ticket" in api_data:
            first_prize_data = {"ticket": api_data["first_ticket"]}

        if first_prize_data and "ticket" in first_prize_data:
            first_amt = amounts.get("1st", "Unknown")
            first_amt = str(first_amt).replace("₹", "").replace("/-", "").replace(",", "").strip()
            prizes[f"1st Prize Rs {first_amt}"] = [first_prize_data["ticket"]]
            
        # 2. Consolation Prize
        if "consolation" in api_prizes and api_prizes["consolation"]:
             cons_amt = amounts.get("consolation", "Unknown")
             cons_amt = str(cons_amt).replace("₹", "").replace("/-", "").replace(",", "").strip()
             prizes[f"Consolation Prize"] = api_prizes["consolation"] # Usually we don't put amt for consolation in our old format, but we can

        # 3. Handle 2nd to 9th
        for i in range(2, 10):
            ord_suffix = "nd" if i == 2 else "rd" if i == 3 else "th"
            key = f"{i}{ord_suffix}" # "2nd", "3rd", etc.
            
            if key in api_prizes and api_prizes[key]:
                amt = amounts.get(key, "Unknown")
                amt = str(amt).replace("₹", "").replace("/-", "").replace(",", "").strip()
                prizes[f"{i}{ord_suffix} Prize Rs {amt}"] = api_prizes[key]
                
        return {
            "name": name,
            "code": code,
            "draw_date": draw_date,
            "iso_date": iso_date,
            "prizes": prizes
        }
    except Exception as e:
        print(f"❌ Transformation Error: {e}")
        return None

async def fetch_api_latest(etag: str = None) -> dict:
    """Fetch the latest draw from India Lottery API."""
    url = f"{BASE_API_URL}/latest"
    headers = {"Accept": "application/json"}
    if etag:
        headers["If-None-Match"] = etag
        
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code == 304:
                return {"status": "not_modified", "etag": etag}
                
            response.raise_for_status()
            data = response.json()
            new_etag = response.headers.get("ETag")
            
            transformed = transform_api_response(data)
            if transformed:
                return {"status": "success", "data": transformed, "etag": new_etag}
            return {"status": "error", "message": "Failed to transform response"}
            
    except Exception as e:
        print(f"❌ API Latest Error: {e}")
        return {"status": "error", "message": str(e)}

async def fetch_api_by_date(date_str: str) -> dict:
    """Fetch a draw by date (YYYY-MM-DD)."""
    url = f"{BASE_API_URL}/by-date"
    params = {"date": date_str}
    headers = {"Accept": "application/json"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            transformed = transform_api_response(data)
            
            if transformed:
                return {"status": "success", "data": transformed}
            return {"status": "error", "message": "Failed to transform response or not found"}
            
    except Exception as e:
        print(f"❌ API By Date Error: {e}")
        return {"status": "error", "message": str(e)}

async def fetch_api_history(limit: int = 10, offset: int = 0) -> dict:
    """Fetch paginated history."""
    url = f"{BASE_API_URL}/history"
    params = {"limit": limit, "offset": offset}
    headers = {"Accept": "application/json"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            items = data.get("items", [])
            
            transformed_items = []
            for item in items:
                # The history endpoint might have a different format, usually it's similar
                # Let's try transforming it; notice we inject amount if necessary
                # "first_ticket" vs "first": {"ticket": ...} handling
                if "first" not in item and "first_ticket" in item:
                    item["first"] = {"ticket": item["first_ticket"]}
                    
                t = transform_api_response(item)
                if t:
                    transformed_items.append(t)
            
            return {
                "status": "success", 
                "data": {
                    "total": data.get("total", 0),
                    "items": transformed_items
                }
            }
            
    except Exception as e:
        print(f"❌ API History Error: {e}")
        return {"status": "error", "message": str(e)}
