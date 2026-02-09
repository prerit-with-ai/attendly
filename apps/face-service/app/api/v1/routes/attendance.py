import logging

from fastapi import APIRouter, File, Form, UploadFile

from app.models.attendance import IdentifyResponse
from app.services import face_engine, storage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/identify", response_model=IdentifyResponse)
async def identify_face(
    company_id: str = Form(...),
    image: UploadFile = File(...),
) -> IdentifyResponse:
    """Identify a face against all enrolled employees for a company."""
    image_bytes = await image.read()
    if not image_bytes:
        return IdentifyResponse(
            identified=False,
            message="Image is empty",
        )

    enrolled = storage.load_all_encodings(company_id)
    if not enrolled:
        return IdentifyResponse(
            identified=False,
            message="No enrolled employees found for this company",
        )

    result = face_engine.identify_face(image_bytes, enrolled)
    return IdentifyResponse(
        identified=result["identified"],
        employee_id=result.get("employee_id"),
        confidence=result["confidence"],
        message=result["message"],
    )
