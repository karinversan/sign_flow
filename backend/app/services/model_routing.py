import hashlib

from sqlalchemy.orm import Session

from app.config import settings
from app.models import ModelVersion, ModelVersionStatus
from app.services.model_versions import get_active_model_version


def _session_bucket(session_id: str) -> int:
    digest = hashlib.sha256(session_id.encode("utf-8")).hexdigest()
    return int(digest[:8], 16) % 100


def select_model_version_id(db: Session, session_id: str, requested_model_id: str | None = None) -> str:
    if requested_model_id:
        requested = db.get(ModelVersion, requested_model_id)
        if not requested:
            raise LookupError("model_not_found")
        return requested.id

    active_model = get_active_model_version(db)
    if not active_model:
        return "stub-v0"

    canary_id = settings.canary_model_id
    canary_percent = max(0, min(settings.canary_traffic_percent, 100))
    if not canary_id or canary_percent <= 0:
        return active_model.id

    canary_model = db.get(ModelVersion, canary_id)
    if not canary_model:
        return active_model.id
    if canary_model.id == active_model.id:
        return active_model.id
    if canary_model.status == ModelVersionStatus.ROLLBACK:
        return active_model.id

    bucket = _session_bucket(session_id)
    if bucket < canary_percent:
        return canary_model.id
    return active_model.id
