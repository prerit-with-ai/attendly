import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import settings
from app.models.enrollment import (
    DetectResponse,
    EnrollmentResponse,
    EnrollmentStatusResponse,
    VerifyResponse,
)
from app.services import face_engine, storage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/enroll", tags=["enrollment"])


@router.post("", response_model=EnrollmentResponse)
async def enroll_face(
    company_id: str = Form(...),
    employee_id: str = Form(...),
    images: list[UploadFile] = File(...),
) -> EnrollmentResponse:
    """Upload face images, extract and store encodings."""
    if len(images) > settings.max_faces_per_employee:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {settings.max_faces_per_employee} images allowed",
        )

    if len(images) == 0:
        raise HTTPException(status_code=400, detail="At least one image is required")

    encodings: list[list[float]] = []
    for i, image in enumerate(images):
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail=f"Image {i + 1} is empty")

        # Validate single face
        detection = face_engine.detect_face(image_bytes)
        if not detection["detected"]:
            raise HTTPException(
                status_code=400,
                detail=f"Image {i + 1}: {detection['message']}",
            )
        if detection["face_count"] > 1:
            raise HTTPException(
                status_code=400,
                detail=f"Image {i + 1}: {detection['message']}",
            )

        # Extract encoding
        try:
            encoding = face_engine.extract_encoding(image_bytes)
            encodings.append(encoding)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Image {i + 1}: {e}")

        # Save photo
        storage.save_photo(company_id, employee_id, image_bytes, i)

    # Save all encodings
    storage.save_encoding(company_id, employee_id, encodings)

    return EnrollmentResponse(
        success=True,
        face_count=len(encodings),
        message=f"Successfully enrolled {len(encodings)} face(s)",
    )


@router.delete("/{company_id}/{employee_id}")
async def delete_enrollment(company_id: str, employee_id: str) -> dict:
    """Delete all face data for an employee."""
    storage.delete_encoding(company_id, employee_id)
    storage.delete_photos(company_id, employee_id)
    return {"success": True, "message": "Face enrollment data deleted"}


@router.get("/{company_id}/{employee_id}/status", response_model=EnrollmentStatusResponse)
async def get_enrollment_status(company_id: str, employee_id: str) -> EnrollmentStatusResponse:
    """Get enrollment status for an employee."""
    face_count = storage.get_photo_count(company_id, employee_id)
    return EnrollmentStatusResponse(
        enrolled=face_count > 0,
        face_count=face_count,
    )


@router.post("/verify", response_model=VerifyResponse)
async def verify_face(
    company_id: str = Form(...),
    employee_id: str = Form(...),
    image: UploadFile = File(...),
) -> VerifyResponse:
    """Verify a face against stored encodings."""
    stored = storage.load_encoding(company_id, employee_id)
    if not stored:
        raise HTTPException(status_code=404, detail="No face enrollment found for this employee")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image is empty")

    result = face_engine.verify_face(image_bytes, stored)
    return VerifyResponse(
        match=result["match"],
        confidence=result["confidence"],
        message=result["message"],
    )


@router.post("/detect", response_model=DetectResponse)
async def detect_face_endpoint(
    image: UploadFile = File(...),
) -> DetectResponse:
    """Check if an image contains a valid face."""
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image is empty")

    result = face_engine.detect_face(image_bytes)
    return DetectResponse(
        detected=result["detected"],
        face_count=result["face_count"],
        confidence=result.get("confidence", 0.0),
        message=result["message"],
    )
