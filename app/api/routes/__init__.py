from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.events import router as events_router
from app.api.routes.health import router as health_router
from app.api.routes.memory import router as memory_router
from app.api.routes.profiles import router as profiles_router

__all__ = [
    "auth_router",
    "chat_router",
    "events_router",
    "health_router",
    "memory_router",
    "profiles_router",
]
