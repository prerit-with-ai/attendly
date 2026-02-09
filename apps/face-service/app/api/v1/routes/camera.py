import logging

import cv2
from fastapi import APIRouter, HTTPException

from app.models.enrollment import TestRtspRequest, TestRtspResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/camera", tags=["camera"])


@router.post("/test-rtsp", response_model=TestRtspResponse)
async def test_rtsp_connection(request: TestRtspRequest) -> TestRtspResponse:
    """Test an RTSP URL connectivity by attempting to grab a single frame."""
    rtsp_url = request.rtsp_url

    if not rtsp_url:
        raise HTTPException(status_code=400, detail="RTSP URL is required")

    try:
        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            return TestRtspResponse(
                success=False,
                message="Failed to connect to RTSP stream. Check the URL and ensure the camera is accessible.",
            )

        ret, _ = cap.read()
        cap.release()

        if not ret:
            return TestRtspResponse(
                success=False,
                message="Connected to stream but failed to read a frame. The stream may be unavailable.",
            )

        return TestRtspResponse(
            success=True,
            message="Successfully connected to RTSP stream and captured a frame.",
        )
    except Exception as e:
        logger.warning("RTSP test failed for %s: %s", rtsp_url, e)
        return TestRtspResponse(
            success=False,
            message=f"Connection error: {e}",
        )
