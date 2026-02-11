import pytest
from fastapi import HTTPException

from app.config import settings
from app.services.uploads import validate_upload_request


def test_validate_upload_request_allows_supported_video():
    sanitized_name = validate_upload_request("../clip demo.mov", "video/quicktime", 1024)
    assert sanitized_name == "clip demo.mov"


def test_validate_upload_request_rejects_unsupported_content_type():
    with pytest.raises(HTTPException) as exc_info:
        validate_upload_request("video.bin", "application/octet-stream", 100)
    assert exc_info.value.status_code == 415
    assert exc_info.value.detail == "unsupported_content_type"


def test_validate_upload_request_rejects_too_large_file():
    with pytest.raises(HTTPException) as exc_info:
        validate_upload_request("video.mp4", "video/mp4", settings.max_upload_size_bytes + 1)
    assert exc_info.value.status_code == 413
    assert exc_info.value.detail == "upload_too_large"
