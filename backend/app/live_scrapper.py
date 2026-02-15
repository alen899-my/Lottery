import cloudscraper
from bs4 import BeautifulSoup
import re
import asyncio
from datetime import datetime

# GoodReturns Kerala Lottery URL
LIVE_URL = "https://www.goodreturns.in/kerala-lottery-results.html"

async def fetch_live_results():
    """
    Fetches lottery results from GoodReturns.in using cloudscraper to bypass bot protection.
    """
    try:
        print(f"🔄 Scrapping Live Data (CloudScraper) from: {LIVE_URL}")
        
        # Run synchronous scraper in a thread to keep async loop happy
        scraper = cloudscraper.create_scraper()
        
        # Define a synchronous function to run
        def get_page():
            return scraper.get(LIVE_URL)
            
        response = await asyncio.to_thread(get_page)
        
        if response.status_code != 200:
            print(f"❌ Scraper Failed: Status {response.status_code}")
            return None
            
        soup = BeautifulSoup(response.text, 'html.parser')

        # 1. Identify valid content block (often inside a specific article or div)
        # We search for the MAIN section containing lottery info
        # Try to get everything to be safe
        full_text = soup.get_text(" ", strip=True) # Normalize whitespace immediately
        
        # DEBUG: Write to file
        with open("debug_scrape.txt", "w", encoding="utf-8") as f:
            f.write(full_text)

        print(f"📄 Scraper Text Preview (first 200 chars): {full_text[:200]}")
        return parse_live_text(full_text)

    except Exception as e:
        print(f"❌ Live Scraper Error: {e}")
        with open("debug_error.txt", "w") as f:
            f.write(str(e))
        return None

def parse_live_text(text):
    data = {
        "name": "Unknown",
        "code": "Unknown",
        "draw_date": "Unknown",
        "prizes": {},
        "is_live": True  # Flag to indicate this is a live/provisional result
    }

    try:
        # 1. Cleaner: Ensure single spaces only (strip=True handled newlines already, but double spaces remain)
        text = re.sub(r'\s+', ' ', text)

        print(f"🔍 Searching 'Upcoming' pattern in text length: {len(text)}")
        
        # --- SPECIAL: UPCOMING DRAW PATTERN (User Requested) ---
        # "Sunday, 15 February 2026 Samrudhi Draw Number SM-42 Winning Price ₹ 1 Crore Result Out In..."
        # Updated Regex: flexible spaces, flexible "Price/Prize" spelling, flexible "Result Out In"
        
        upcoming_pattern = re.search(r"(\w+,\s+\d{1,2}\s+\w+\s+\d{4})\s+(.*?)\s+Draw Number\s+([A-Z0-9-]+)\s+Winning Pri[cz]e\s+(.*?)\s+Result Out In", text, re.IGNORECASE)
        
        if upcoming_pattern:
            print(f"✅ FOUND UPCOMING: {upcoming_pattern.groups()}")
            # We found the specific "Next Draw" banner
            full_date_str = upcoming_pattern.group(1).strip() # e.g. Sunday, 15 February 2026
            name = upcoming_pattern.group(2).strip()          # Samrudhi
            code = upcoming_pattern.group(3).strip()          # SM-42
            jackpot = upcoming_pattern.group(4).strip()       # ₹ 1 Crore
            
            data["name"] = name
            data["code"] = code
            data["is_upcoming"] = True
            data["prizes"][f"1st Prize Rs {jackpot}"] = ["WAITING"] # Placeholder for jackpot display
            
            # Parse Date
            try:
                # Remove Day name (Sunday, ) to parse date
                clean_date = re.sub(r"^\w+,\s*", "", full_date_str).strip()
                data["iso_date"] = datetime.strptime(clean_date, "%d %B %Y")
                data["draw_date"] = data["iso_date"].strftime("%d/%m/%Y")
            except Exception as e:
                print(f"⚠️ Date parse error (Upcoming): {e}")
                data["draw_date"] = full_date_str
                # Try simple format if day removal failed
                try:
                     clean_date = re.sub(r"^\w+,\s*", "", full_date_str).strip()
                     data["iso_date"] = datetime.strptime(clean_date, "%d %b %Y")
                     data["draw_date"] = data["iso_date"].strftime("%d/%m/%Y")
                except:
                     data["iso_date"] = datetime.now()

            return data # Return immediately as this is the "Headline" item
        
        print("❌ 'Upcoming' pattern match failed. Checking for standard results...")
        
        # -------------------------------------------------------

        # 2. Extract Name and Code (Standard Results)
        # Look for pattern: Name (Code)

        if "iso_date" not in data:
            data["iso_date"] = datetime.now()

        # 2. Extract Name and Code (Standard Results)
        # Look for pattern: Name (Code)
        header_match = re.search(r"Kerala Lottery ([A-Za-z\s]+) ([A-Z]{2,}-\d+) Results Declared", text, re.IGNORECASE)
        if not header_match:
             # Fallback: "Samrudhi Draw Number SM-42"
             header_match = re.search(r"([A-Za-z]+)\s+Draw Number\s+([A-Z]{2,}-\d+)", text, re.IGNORECASE)

        if header_match:
            data["name"] = header_match.group(1).strip()
            data["code"] = header_match.group(2).strip()

        # 3. Extract Date
        date_match = re.search(r"(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})", text, re.IGNORECASE)
        if date_match:
            raw_date = date_match.group(1)
            try:
                raw_date = re.sub(r'\s+', ' ', raw_date)
                parsed_date = datetime.strptime(raw_date, "%d %B %Y")
                data["draw_date"] = parsed_date.strftime("%d/%m/%Y")
                data["iso_date"] = parsed_date
            except:
                try:
                    parsed_date = datetime.strptime(raw_date, "%d %b %Y")
                    data["draw_date"] = parsed_date.strftime("%d/%m/%Y")
                    data["iso_date"] = parsed_date
                except:
                    data["draw_date"] = raw_date # Fallback

        # 4. Extract Prizes
        first_prize_match = re.search(r"1st Prize - (?:₹|Rs\.?)\s?([\d\s,]+(?:Crore|Lakh)?)\s+([A-Z]{2}\s?\d{6})", text, re.IGNORECASE)
        if first_prize_match:
            amt = first_prize_match.group(1).strip()
            ticket = first_prize_match.group(2).strip()
            data["prizes"][f"1st Prize Rs {amt}"] = [ticket]
        else:
             # Try simpler format seen in text: "1st Prize of ₹1 Crore goes to... KC 889462"
             first_prize_text_match = re.search(r"1st Prize of.*?(?:₹|Rs\.?)\s?([\d\s,]+(?:Crore|Lakh)?).*?([A-Z]{2}\s?\d{6})", text, re.IGNORECASE)
             if first_prize_text_match:
                amt = first_prize_text_match.group(1).strip()
                ticket = first_prize_text_match.group(2).strip()
                data["prizes"][f"1st Prize Rs {amt}"] = [ticket]

        # 2nd Prize
        second_prize_match = re.search(r"2nd Prize - (?:₹|Rs\.?)\s?([\d\s,]+(?:Crore|Lakh)?)\s+([A-Z]{2}\s\d{6})", text, re.IGNORECASE)
        if second_prize_match:
             amt = second_prize_match.group(1).strip()
             ticket = second_prize_match.group(2).strip()
             data["prizes"][f"2nd Prize Rs {amt}"] = [ticket]
        
        # 3rd Prize
        third_prize_match = re.search(r"3rd Prize - (?:₹|Rs\.?)\s?([\d\s,]+(?:Crore|Lakh)?)\s+([A-Z]{2}\s\d{6})", text, re.IGNORECASE)
        if third_prize_match:
             amt = third_prize_match.group(1).strip()
             ticket = third_prize_match.group(2).strip()
             data["prizes"][f"3rd Prize Rs {amt}"] = [ticket]

        # Consolation
        cons_section = re.search(r"Consolation Prize.*?\n(.*?)(?=\d+(?:st|nd|rd|th) Prize|The)", text, re.DOTALL | re.IGNORECASE)
        if cons_section:
             cons_nums = re.findall(r"[A-Z]{2}\s\d{6}", cons_section.group(1))
             if cons_nums:
                 data["prizes"]["Consolation Prize"] = cons_nums

        # 4th - 9th Prizes
        for i in range(4, 10):
            block_match = re.search(rf"{i}th Prize.*?[₹Rs]+[\d,\s]+(.*?)(?=\d+th Prize|Kerala Lottery|Read More|$)", text, re.DOTALL | re.IGNORECASE)
            if block_match:
                nums = re.findall(r"\b\d{4}\b", block_match.group(1))
                if nums:
                    amt_match = re.search(rf"{i}th Prize - (?:₹|Rs\.?)\s?([\d,]+)", text, re.IGNORECASE)
                    amt_str = amt_match.group(1) if amt_match else "Unknown"
                    data["prizes"][f"{i}th Prize Rs {amt_str}"] = nums

        return data

    except Exception as e:
        print(f"❌ Live Parse Error: {e}")
        return None
