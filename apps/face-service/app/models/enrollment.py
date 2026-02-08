from pydantic import BaseModel


class EnrollmentResponse(BaseModel):
    success: bool
    face_count: int
    message: str


class EnrollmentStatusResponse(BaseModel):
    enrolled: bool
    face_count: int


class VerifyResponse(BaseModel):
    match: bool
    confidence: float
    message: str


class DetectResponse(BaseModel):
    detected: bool
    face_count: int
    confidence: float = 0.0
    message: str


class TestRtspRequest(BaseModel):
    rtsp_url: str


class TestRtspResponse(BaseModel):
    success: bool
    message: str
