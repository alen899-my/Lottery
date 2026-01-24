import httpx
from bs4 import BeautifulSoup
from pypdf import PdfReader
import io
import re
import asyncio

BASE_URL = "https://statelottery.kerala.gov.in/English/index.php/lottery-result-view"

async def fetch_latest_results():
    # Set a generous timeout for government servers
    timeout = httpx.Timeout(60.0, connect=20.0) 
    
    # Professional headers to mimic a real browser
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # Retry logic: Try 3 times before giving up
    for attempt in range(3):
        async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
            try:
                print(f"🔄 Attempt {attempt + 1}: Fetching Kerala Lottery results...")
                response = await client.get(BASE_URL)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # 1. Find the first 'View' link in the results table
                # The site uses a specific table structure; we look for the first link with 'View' text
                view_link = soup.find('a', string=re.compile(r'View', re.I))
                if not view_link:
                    print("⚠️ Could not find any result links on the page.")
                    return None
                
                pdf_url = view_link['href']
                # If the URL is relative, join it with the base
                if not pdf_url.startswith('http'):
                    pdf_url = "https://statelottery.kerala.gov.in/English/" + pdf_url

                print(f"📄 Found PDF URL: {pdf_url}")

                # 2. Download the PDF
                pdf_response = await client.get(pdf_url)
                pdf_response.raise_for_status()
                
                # 3. Parse PDF Text
                pdf_file = io.BytesIO(pdf_response.content)
                reader = PdfReader(pdf_file)
                full_text = ""
                for page in reader.pages:
                    full_text += page.extract_text()
                
                # 4. Use our regex parser logic
                return parse_lottery_text(full_text)

            except (httpx.ReadTimeout, httpx.ConnectTimeout):
                print(f"⏳ Timeout on attempt {attempt + 1}. Retrying in 5 seconds...")
                await asyncio.sleep(5)
                continue
            except Exception as e:
                print(f"❌ Scraper Error: {e}")
                return None
                
    print("🛑 Max retries reached. Kerala Lottery site is likely down.")
    return {"error": "All attempts failed due to timeout"}

def parse_lottery_text(text):
    try:
        # 1. Metadata Extraction
        name_match = re.search(r"(?:EMAIL:.*?\s+)?([A-Z\s\-]{3,})\s+LOTTERY NO", text, re.DOTALL)
        code_match = re.search(r"NO\.([A-Z0-9\-]+)", text)
        date_match = re.search(r"held on:-\s+(\d{2}/\d{2}/\d{4})", text)

        data = {
            "name": name_match.group(1).strip() if name_match else "Unknown",
            "code": code_match.group(1).strip() if code_match else "Unknown",
            "draw_date": date_match.group(1).strip() if date_match else "Unknown",
            "prizes": {}
        }

        # 2. DYNAMIC PRIZE PARSING
        prize_blocks = re.findall(r"(\d+(?:st|nd|rd|th)\s+Prize.*?)(?=\d+(?:st|nd|rd|th)\s+Prize|The prize winners|$)", text, re.DOTALL)

        for block in prize_blocks:
            # Extract the Label (e.g., 1st Prize Rs :10000000/-)
            label_match = re.match(r"(.*?Prize.*?/-)", block)
            if not label_match:
                continue
                
            label = label_match.group(1).strip()
            
            # --- SPECIAL HANDLING FOR 1ST PRIZE & CONSOLATION ---
            if "1st Prize" in label:
                # Find the single 1st Prize winner (after the '1)')
                first_winner = re.search(r"1\)\s+([A-Z]{2}\s\d{6})", block)
                if first_winner:
                    data["prizes"][label] = [first_winner.group(1)]
                
                # Find all Consolation Prizes in this same block
                cons_block = re.search(r"Cons Prize-Rs :.*?\n?(.*)", block, re.DOTALL)
                if cons_block:
                    cons_numbers = re.findall(r"\b[A-Z]{2}\s\d{6}\b", cons_block.group(1))
                    if cons_numbers:
                        data["prizes"]["Consolation Prize"] = cons_numbers
                continue

            # --- HANDLING OTHER PRIZES (2nd, 3rd, 4th, etc.) ---
            # Check for high-value formats (Series + 6 digits)
            high_val = re.findall(r"\b[A-Z]{2}\s\d{6}\b", block)
            
            if high_val:
                data["prizes"][label] = high_val
            else:
                # Low-value: Find ALL 4-digit numbers
                all_nums = re.findall(r"\b\d{4}\b", block)
                
                # Check for prize amount in label to avoid duplicates
                prize_amount_match = re.search(r":(\d+)/-", label)
                if prize_amount_match and all_nums:
                    amount = prize_amount_match.group(1)
                    # Filter out the amount if it's the first element in the numbers list
                    if all_nums[0] == amount:
                        data["prizes"][label] = all_nums[1:]
                    else:
                        data["prizes"][label] = all_nums
                else:
                    data["prizes"][label] = all_nums

        return data
    except Exception as e:
        print(f"❌ Final Parsing Error: {e}")
        return None