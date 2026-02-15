import asyncio
from app.live_scrapper import fetch_live_results

async def main():
    print("🚀 Triggering scraper manually...")
    data = await fetch_live_results()
    print("✅ Result:", data)

if __name__ == "__main__":
    asyncio.run(main())
