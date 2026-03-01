from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes import router
from app.database import collection

load_dotenv()

# --- FASTAPI SETUP ---
app = FastAPI(title="Kerala Lottery API")

# 2. DYNAMIC CORS CONFIGURATION
origins = [
    "http://localhost:3000",           # Local Web
    "http://localhost:8083",           # Local Mobile (Metro)
    "https://kerala-win.vercel.app",    # Production Web
    "http://10.177.249.145:8081",      # Hotspot Mobile
]

app.add_middleware(
    CORSMiddleware,
    # If testing APK and getting "Network Error", change this to ["*"] 
    # but set allow_credentials=False
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    # 3. DYNAMIC PORT SELECTION
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
