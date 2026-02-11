from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ModelVersion, ModelVersionStatus
from app.services.sessions import utc_now


def ensure_default_model_version(db: Session) -> ModelVersion:
    active = db.scalars(select(ModelVersion).where(ModelVersion.is_active.is_(True))).first()
    if active:
        return active

    default_model = ModelVersion(
        name="stub-default",
        hf_repo="local/stub",
        hf_revision="main",
        framework="stub",
        status=ModelVersionStatus.ACTIVE,
        is_active=True,
        created_at=utc_now(),
        updated_at=utc_now(),
    )
    db.add(default_model)
    db.commit()
    db.refresh(default_model)
    return default_model


def get_active_model_version(db: Session) -> ModelVersion | None:
    return db.scalars(select(ModelVersion).where(ModelVersion.is_active.is_(True))).first()


def activate_model_version(db: Session, model: ModelVersion) -> ModelVersion:
    now = utc_now()
    active_models = db.scalars(select(ModelVersion).where(ModelVersion.is_active.is_(True))).all()
    for current in active_models:
        current.is_active = False
        if current.status == ModelVersionStatus.ACTIVE:
            current.status = ModelVersionStatus.STAGING
        current.updated_at = now

    model.is_active = True
    model.status = ModelVersionStatus.ACTIVE
    model.updated_at = now
    db.commit()
    db.refresh(model)
    return model
