from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analytics import router as analytics_router
from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.debug_tools import router as debug_tools_router
from app.api.routes.events import router as events_router
from app.api.routes.health import router as health_router
from app.api.routes.memory import router as memory_router
from app.api.routes.profiles import router as profiles_router
from app.api.routes.realtime import router as realtime_router
from app.api.routes.realtime_session import router as realtime_session_router
from app.api.routes.voice import router as voice_router
from app.core.config import get_settings
from app.core.logging import configure_logging

settings = get_settings()
configure_logging()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list if settings.cors_origin_list != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["health"])
app.include_router(auth_router, tags=["auth"])
app.include_router(chat_router, tags=["chat"])
app.include_router(memory_router, tags=["memory"])
app.include_router(profiles_router, tags=["profiles"])
app.include_router(events_router, tags=["events"])
app.include_router(analytics_router, tags=["analytics"])
app.include_router(voice_router, tags=["voice"])
app.include_router(realtime_router, tags=["realtime"])
app.include_router(realtime_session_router, tags=["realtime-sessions"])
app.include_router(debug_tools_router, tags=["debug"])


@app.get("/")
async def root():
    return {"name": settings.app_name, "status": "ready"}
