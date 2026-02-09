from fastapi import APIRouter

from app.api.v1.routes import attendance, camera, enrollment, health, stream

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(enrollment.router)
api_router.include_router(camera.router)
api_router.include_router(attendance.router)
api_router.include_router(stream.router)
