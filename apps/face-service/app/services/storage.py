import json
import logging
import os
import shutil
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


def _encodings_dir() -> Path:
    return Path(settings.storage_path) / "encodings"


def _photos_dir() -> Path:
    return Path(settings.storage_path) / "photos"


def ensure_directories() -> None:
    """Create storage directories if they don't exist."""
    _encodings_dir().mkdir(parents=True, exist_ok=True)
    _photos_dir().mkdir(parents=True, exist_ok=True)


def save_encoding(company_id: str, employee_id: str, encodings: list[list[float]]) -> None:
    """Save face encodings to JSON file."""
    enc_dir = _encodings_dir() / company_id
    enc_dir.mkdir(parents=True, exist_ok=True)
    filepath = enc_dir / f"{employee_id}.json"
    with open(filepath, "w") as f:
        json.dump({"encodings": encodings}, f)
    logger.info("Saved %d encodings for %s/%s", len(encodings), company_id, employee_id)


def load_encoding(company_id: str, employee_id: str) -> list[list[float]] | None:
    """Load face encodings from JSON file. Returns None if not found."""
    filepath = _encodings_dir() / company_id / f"{employee_id}.json"
    if not filepath.exists():
        return None
    with open(filepath) as f:
        data = json.load(f)
    return data.get("encodings")


def delete_encoding(company_id: str, employee_id: str) -> None:
    """Delete face encoding file."""
    filepath = _encodings_dir() / company_id / f"{employee_id}.json"
    if filepath.exists():
        filepath.unlink()
        logger.info("Deleted encoding for %s/%s", company_id, employee_id)


def save_photo(company_id: str, employee_id: str, image_bytes: bytes, index: int) -> str:
    """Save a face photo. Returns the relative path."""
    photo_dir = _photos_dir() / company_id / employee_id
    photo_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{index}.jpg"
    filepath = photo_dir / filename
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return str(filepath.relative_to(Path(settings.storage_path)))


def delete_photos(company_id: str, employee_id: str) -> None:
    """Delete all photos for an employee."""
    photo_dir = _photos_dir() / company_id / employee_id
    if photo_dir.exists():
        shutil.rmtree(photo_dir)
        logger.info("Deleted photos for %s/%s", company_id, employee_id)


def get_photo_count(company_id: str, employee_id: str) -> int:
    """Count how many photos are stored for an employee."""
    photo_dir = _photos_dir() / company_id / employee_id
    if not photo_dir.exists():
        return 0
    return len([f for f in photo_dir.iterdir() if f.suffix in (".jpg", ".jpeg", ".png")])
