import logging

from fastapi import APIRouter

from app.models.attendance import (
    StreamStartRequest,
    StreamStartResponse,
    StreamStatusResponse,
    StreamStopRequest,
)
from app.services.stream_manager import stream_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stream", tags=["stream"])


@router.post("/start", response_model=StreamStartResponse)
async def start_stream(request: StreamStartRequest) -> StreamStartResponse:
    """Start processing an RTSP stream for face recognition."""
    started = stream_manager.start_stream(
        camera_id=request.camera_id,
        rtsp_url=request.rtsp_url,
        company_id=request.company_id,
        location_id=request.location_id,
        callback_url=request.callback_url,
        frame_interval=request.frame_interval,
    )
    if started:
        return StreamStartResponse(
            success=True,
            message=f"Stream started for camera {request.camera_id}",
        )
    return StreamStartResponse(
        success=False,
        message=f"Stream already running for camera {request.camera_id}",
    )


@router.post("/stop", response_model=StreamStartResponse)
async def stop_stream(request: StreamStopRequest) -> StreamStartResponse:
    """Stop processing an RTSP stream."""
    stopped = stream_manager.stop_stream(request.camera_id)
    if stopped:
        return StreamStartResponse(
            success=True,
            message=f"Stream stopped for camera {request.camera_id}",
        )
    return StreamStartResponse(
        success=False,
        message=f"No active stream found for camera {request.camera_id}",
    )


@router.get("/status", response_model=StreamStatusResponse)
async def get_stream_status() -> StreamStatusResponse:
    """Get status of all active streams."""
    return StreamStatusResponse(active_streams=stream_manager.get_status())
