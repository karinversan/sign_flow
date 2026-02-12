from sqlalchemy import update

from app.config import settings
from app.db import SessionLocal
from app.models import ModelVersion, ModelVersionStatus
from app.services.model_routing import select_model_version_id
from app.services.sessions import utc_now


def _create_model(db, name: str, *, status: ModelVersionStatus, is_active: bool) -> ModelVersion:
    now = utc_now()
    model = ModelVersion(
        name=name,
        hf_repo=f"local/{name}",
        hf_revision="main",
        framework="onnx",
        status=status,
        is_active=is_active,
        created_at=now,
        updated_at=now,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return model


def test_select_model_returns_requested_when_exists():
    db = SessionLocal()
    previous_canary_id = settings.canary_model_id
    previous_canary_percent = settings.canary_traffic_percent
    try:
        db.execute(update(ModelVersion).values(is_active=False, status=ModelVersionStatus.STAGING))
        db.commit()
        active = _create_model(db, "active", status=ModelVersionStatus.ACTIVE, is_active=True)
        requested = _create_model(db, "requested", status=ModelVersionStatus.STAGING, is_active=False)
        settings.canary_model_id = active.id
        settings.canary_traffic_percent = 100

        resolved = select_model_version_id(db, session_id="session-a", requested_model_id=requested.id)
        assert resolved == requested.id
    finally:
        settings.canary_model_id = previous_canary_id
        settings.canary_traffic_percent = previous_canary_percent
        db.close()


def test_select_model_routes_to_canary_when_bucket_hits(monkeypatch):
    db = SessionLocal()
    previous_canary_id = settings.canary_model_id
    previous_canary_percent = settings.canary_traffic_percent
    try:
        db.execute(update(ModelVersion).values(is_active=False, status=ModelVersionStatus.STAGING))
        db.commit()
        active = _create_model(db, "active", status=ModelVersionStatus.ACTIVE, is_active=True)
        canary = _create_model(db, "canary", status=ModelVersionStatus.STAGING, is_active=False)
        settings.canary_model_id = canary.id
        settings.canary_traffic_percent = 20

        monkeypatch.setattr("app.services.model_routing._session_bucket", lambda _session_id: 9)
        resolved = select_model_version_id(db, session_id="session-b", requested_model_id=None)
        assert resolved == canary.id
        assert resolved != active.id
    finally:
        settings.canary_model_id = previous_canary_id
        settings.canary_traffic_percent = previous_canary_percent
        db.close()


def test_select_model_routes_to_active_when_bucket_misses(monkeypatch):
    db = SessionLocal()
    previous_canary_id = settings.canary_model_id
    previous_canary_percent = settings.canary_traffic_percent
    try:
        db.execute(update(ModelVersion).values(is_active=False, status=ModelVersionStatus.STAGING))
        db.commit()
        active = _create_model(db, "active-2", status=ModelVersionStatus.ACTIVE, is_active=True)
        canary = _create_model(db, "canary-2", status=ModelVersionStatus.STAGING, is_active=False)
        settings.canary_model_id = canary.id
        settings.canary_traffic_percent = 20

        monkeypatch.setattr("app.services.model_routing._session_bucket", lambda _session_id: 88)
        resolved = select_model_version_id(db, session_id="session-c", requested_model_id=None)
        assert resolved == active.id
        assert resolved != canary.id
    finally:
        settings.canary_model_id = previous_canary_id
        settings.canary_traffic_percent = previous_canary_percent
        db.close()
