import io
import logging

import numpy as np
from deepface import DeepFace
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)


def _load_image(image_bytes: bytes) -> np.ndarray:
    """Load image bytes into a numpy array (RGB)."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return np.array(img)


def preload_model() -> None:
    """Pre-load the face recognition model so the first request isn't slow."""
    logger.info("Pre-loading face model: %s with detector: %s", settings.face_model, settings.face_detector)
    # Build the model by running a dummy representation
    # DeepFace caches models after first use
    dummy = np.zeros((224, 224, 3), dtype=np.uint8)
    try:
        DeepFace.represent(
            img_path=dummy,
            model_name=settings.face_model,
            detector_backend=settings.face_detector,
            enforce_detection=False,
        )
        logger.info("Face model pre-loaded successfully")
    except Exception as e:
        logger.warning("Model pre-load warning (expected on dummy image): %s", e)


def detect_face(image_bytes: bytes) -> dict:
    """Check if an image contains a valid face. Returns detection info."""
    img = _load_image(image_bytes)
    try:
        results = DeepFace.extract_faces(
            img_path=img,
            detector_backend=settings.face_detector,
            enforce_detection=True,
        )
        face_count = len(results)
        if face_count == 0:
            return {"detected": False, "face_count": 0, "message": "No face detected"}
        if face_count > 1:
            return {
                "detected": True,
                "face_count": face_count,
                "message": "Multiple faces detected. Please ensure only one person is in the photo.",
            }
        confidence = float(results[0].get("confidence", 0))
        return {
            "detected": True,
            "face_count": 1,
            "confidence": confidence,
            "message": "Face detected successfully",
        }
    except Exception as e:
        logger.warning("Face detection failed: %s", e)
        return {"detected": False, "face_count": 0, "message": "No face detected in image. Please try again with a clearer photo."}


def extract_encoding(image_bytes: bytes) -> list[float]:
    """Extract a 512-dimensional face encoding from an image."""
    img = _load_image(image_bytes)
    results = DeepFace.represent(
        img_path=img,
        model_name=settings.face_model,
        detector_backend=settings.face_detector,
        enforce_detection=True,
    )
    if not results:
        raise ValueError("No face detected in image")
    if len(results) > 1:
        raise ValueError("Multiple faces detected. Please ensure only one person is in the photo.")
    return [float(x) for x in results[0]["embedding"]]


def compare_encodings(encoding1: list[float], encoding2: list[float]) -> float:
    """Compute cosine similarity between two face encodings."""
    a = np.array(encoding1)
    b = np.array(encoding2)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))


def verify_face(
    image_bytes: bytes, stored_encodings: list[list[float]]
) -> dict:
    """Verify a face against stored encodings. Returns best match info."""
    try:
        new_encoding = extract_encoding(image_bytes)
    except ValueError as e:
        return {"match": False, "confidence": 0.0, "message": str(e)}

    best_confidence = 0.0
    for stored in stored_encodings:
        similarity = compare_encodings(new_encoding, stored)
        if similarity > best_confidence:
            best_confidence = similarity

    is_match = best_confidence >= settings.min_confidence
    return {
        "match": is_match,
        "confidence": round(best_confidence, 4),
        "message": "Face matched" if is_match else "Face did not match",
    }
