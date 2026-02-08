import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.v1.routes.health import router as health_router
from app.core.config import settings
from app.services import storage
from app.services.face_engine import preload_model
from app.services.stream_manager import stream_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Startup
    logger.info("Starting face service...")
    storage.ensure_directories()
    preload_model()
    logger.info("Face service ready")
    yield
    # Shutdown
    logger.info("Shutting down face service")
    stream_manager.stop_all()


app = FastAPI(
    title="Attndly Face Service",
    description="Face recognition microservice for Attndly attendance tracking",
    version=settings.version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount health at root level (no /api/v1 prefix) for easy health checks
app.include_router(health_router, tags=["health"])

# Mount versioned API
app.include_router(api_router)
