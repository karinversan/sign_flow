from pathlib import Path

from fastapi import HTTPException

from app.config import settings


def allowed_upload_content_types() -> set[str]:
    return {item.strip().lower() for item in settings.allowed_upload_content_types.split(",") if item.strip()}


def sanitize_upload_file_name(file_name: str) -> str:
    sanitized = Path(file_name).name.strip().replace("\x00", "")
    if not sanitized or sanitized in {".", ".."}:
        raise HTTPException(status_code=400, detail="invalid_file_name")
    return sanitized


def validate_upload_request(file_name: str, content_type: str, file_size_bytes: int | None = None) -> str:
    sanitized = sanitize_upload_file_name(file_name)

    normalized_type = content_type.strip().lower()
    if normalized_type not in allowed_upload_content_types():
        raise HTTPException(status_code=415, detail="unsupported_content_type")

    if file_size_bytes is not None:
        if file_size_bytes <= 0:
            raise HTTPException(status_code=400, detail="invalid_file_size")
        if file_size_bytes > settings.max_upload_size_bytes:
            raise HTTPException(status_code=413, detail="upload_too_large")

    return sanitized
