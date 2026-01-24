from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict

class LotteryResult(BaseModel):
    name: str                   # e.g., SUVARNA KERALAM
    code: str                   # e.g., SK-37
    draw_date: str              # e.g., 23/01/2026
    prizes: Dict[str, List[str]] # e.g., {"1st Prize": ["RH 700044"], "4th Prize": ["1671", "2881"]}
    scraped_at: datetime = Field(default_factory=datetime.utcnow)