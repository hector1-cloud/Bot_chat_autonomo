"""Vercel Python serverless entry point.

Vercel routes every request matching `/api/*` (see vercel.json) to this file.
The existing FastAPI application lives in `app/main.py` with its routes mounted
at the root (`/health`, `/chat`, ...). We mount it under `/api` here so the
public URLs become `/api/health`, `/api/chat`, `/api/docs`, etc.
"""

from fastapi import FastAPI

from app.main import app as hectron_app

app = FastAPI(title="HECTRON API (Vercel)")

# Mounting the existing app under /api keeps every route reachable behind the
# `/api` prefix that the frontend and vercel.json rewrites expect.
app.mount("/api", hectron_app)
