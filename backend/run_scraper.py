import asyncio
from app.india_lottery_api import fetch_api_latest

async def main():
    print("🚀 Testing India Lottery API locally...")
    result = await fetch_api_latest()
    if result and result.get("status") == "success":
        print("✅ Success! Transformed Data:\n")
        import json
        print(json.dumps(result["data"], indent=4, default=str))
    else:
        print("❌ Failed:", result)

if __name__ == "__main__":
    asyncio.run(main())
