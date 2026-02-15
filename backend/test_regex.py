import re
from datetime import datetime

text = """Sunday, 15 February 2026 Samrudhi Draw Number SM-42 Winning Price ₹ 1 Crore Result Out In 05 Hours 02 Minutes 17 Seconds More Results"""

# Normalize like in the scraper
text = re.sub(r'\n+', ' ', text)

print(f"Testing text: '{text}'")

upcoming_pattern = re.search(r"(\w+,\s+\d{1,2}\s+\w+\s+\d{4})\s+(\w+)\s+Draw Number\s+([A-Z0-9-]+)\s+Winning Price\s+(.*?)\s+Result Out In", text, re.IGNORECASE)

if upcoming_pattern:
    print("✅ Match Found!")
    print(f"Date: {upcoming_pattern.group(1)}")
    print(f"Name: {upcoming_pattern.group(2)}")
    print(f"Code: {upcoming_pattern.group(3)}")
    print(f"Jackpot: {upcoming_pattern.group(4)}")
else:
    print("❌ No Match")
