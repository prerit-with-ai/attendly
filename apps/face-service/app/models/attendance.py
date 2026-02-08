from pydantic import BaseModel


class IdentifyResponse(BaseModel):
    identified: bool
    employee_id: str | None = None
    confidence: float = 0.0
    message: str


class StreamStartRequest(BaseModel):
    camera_id: str
    rtsp_url: str
    company_id: str
    location_id: str
    callback_url: str
    frame_interval: int = 30  # process every Nth frame


class StreamStartResponse(BaseModel):
    success: bool
    message: str


class StreamStopRequest(BaseModel):
    camera_id: str


class StreamStatusResponse(BaseModel):
    active_streams: list[dict]
