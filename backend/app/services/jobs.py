from time import perf_counter
from typing import Literal

from sqlalchemy import delete

from app.db import SessionLocal
from app.metrics import observe_job_processing
from app.models import Job, JobStatus, SessionStatus, TranscriptSegment
from app.providers.registry import get_model_provider
from app.services.sessions import utc_now

JobProcessResult = Literal["done", "failed", "expired", "not_found"]


def process_job_by_id(job_id: str) -> JobProcessResult:
    started_at = perf_counter()

    def _finish(outcome: JobProcessResult) -> JobProcessResult:
        observe_job_processing(outcome, perf_counter() - started_at)
        return outcome

    with SessionLocal() as db:
        job = db.get(Job, job_id)
        if not job:
            return _finish("not_found")

        session = job.session
        now = utc_now()
        if session.status != SessionStatus.ACTIVE or session.expires_at <= now:
            session.status = SessionStatus.EXPIRED
            job.status = JobStatus.EXPIRED
            job.updated_at = now
            db.commit()
            return _finish("expired")

        if not session.video_object_key:
            job.status = JobStatus.FAILED
            job.updated_at = now
            db.commit()
            return _finish("failed")

        job.status = JobStatus.PROCESSING
        job.progress = max(job.progress, 20)
        job.updated_at = now
        db.commit()

        provider = get_model_provider()
        try:
            generated = provider.transcribe(
                session.video_object_key,
                options={"session_id": session.id, "model_id": job.model_version_id},
            )
        except Exception:
            job.status = JobStatus.FAILED
            job.updated_at = utc_now()
            db.commit()
            return _finish("failed")

        db.execute(delete(TranscriptSegment).where(TranscriptSegment.job_id == job.id))
        for item in generated:
            db.add(
                TranscriptSegment(
                    job_id=job.id,
                    order_index=item.order_index,
                    start_sec=item.start_sec,
                    end_sec=item.end_sec,
                    text=item.text,
                    confidence=item.confidence,
                    version=1,
                )
            )

        job.status = JobStatus.DONE
        job.progress = 100
        job.updated_at = utc_now()
        session.last_activity_at = utc_now()
        db.commit()
        return _finish("done")
