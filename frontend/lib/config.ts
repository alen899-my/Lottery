// lib/config.ts

// Priority: 1. Environment Variable -> 2. Fallback to 127.0.0.1
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";