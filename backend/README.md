# SignFlow Backend (Phase 1 Skeleton)

This folder contains the first executable backend scaffold aligned with `docs/BACKEND_PLAN.md`.

## Included now

- FastAPI service with `/v1` endpoints for sessions/jobs/segments/exports.
- Postgres-backed persistence via SQLAlchemy.
- 45-minute editing sessions with expiration checks.
- Session restore flow with frontend lock when session expires.
- Stub model provider (`ModelProvider` abstraction).
- HF provider skeleton (`MODEL_PROVIDER=hf`) for future Hugging Face runtime wiring.
- Model version registry API (`/v1/models`) with active model switching.
- Model artifact sync endpoint (`POST /v1/models/{id}/sync`) with local/offline cache fallback.
- MinIO presigned upload/download URL integration.
- Upload request validation (MIME + size guard).
- Per-endpoint API rate limits (in-memory baseline).
- Worker process to expire sessions/jobs in background.
- Queue-based async inference pipeline (Redis list + worker), toggle via `ASYNC_JOB_PROCESSING_ENABLED`.
- Worker retry policy with dead-letter queue for non-recoverable jobs.
- Monitoring stack with Prometheus alerts and provisioned Grafana dashboard.
- Unit tests for session TTL, upload validation, and rate limiting.
- Integration tests for API flow with Postgres + MinIO.
- Alembic migration scaffold (`alembic/`).

## Run with Docker Compose

From repository root:

```bash
docker compose -f docker-compose.backend.yml up --build
```

API: `http://localhost:8000/v1/health`

Prometheus: `http://localhost:9090`  
Grafana: `http://localhost:3005` (admin/admin)

## Migrations

Run inside backend container (or local venv):

```bash
alembic upgrade head
```

## Model sync quick check

```bash
curl -s -X POST http://localhost:8000/v1/models \
  -H "Content-Type: application/json" \
  -d '{"name":"hf-local","hf_repo":"local/demo","hf_revision":"main","framework":"onnx"}'

curl -s -X POST http://localhost:8000/v1/models/<model-id>/sync
```

### Artifact-driven HF output (without real model runtime)

If synced model artifacts contain `segments.json` (or `transcript.txt`), HF provider uses that content as subtitle output.

Example `segments.json`:

```json
[
  {"start_sec": 0.0, "end_sec": 2.8, "text": "Intro line", "confidence": 0.92},
  {"start_sec": 2.8, "end_sec": 6.4, "text": "Second line", "confidence": 0.88}
]
```

## Canary routing (baseline)

When user doesn't specify `model_version_id` during job creation, backend can route some traffic to canary model:

- `CANARY_MODEL_ID=<model-id>`
- `CANARY_TRAFFIC_PERCENT=0..100`

Routing is deterministic per session id (hash bucket).

## Auth baseline (API key)

- Enable with `AUTH_ENABLED=true`.
- User keys: `AUTH_API_KEYS=key1,key2` (require `x-user-id` header).
- Admin keys: `AUTH_ADMIN_API_KEYS=adminkey` (can mutate model registry/sync).

When auth is disabled (default), API keeps current anonymous behavior for frontend prototypes.

## Audit persistence and retention

- Events are logged via `signflow.audit` and persisted into `audit_events` when `AUDIT_PERSIST_ENABLED=true`.
- Worker prunes old rows using:
  - `AUDIT_RETENTION_DAYS`
  - `AUDIT_CLEANUP_BATCH_SIZE`
  - `WORKER_AUDIT_CLEANUP_INTERVAL_SECONDS`

## Ops templates

- Triton compose profile: `backend/ops/docker-compose.triton.yml`
- Triton evaluation runbook: `backend/ops/TRITON_EVALUATION.md`
- KEDA autoscaling template: `backend/ops/keda/scaledobject-inference-worker.yaml`
- GPU deployment template: `backend/ops/kubernetes/inference-gpu-deployment.yaml`

## Important notes

- This is phase-1 backend scaffolding, not full production inference.
- HF provider supports artifact-driven output (`segments.json` / `transcript.txt`) but not full production inference yet.
- API still creates tables at startup for local bootstrap; use Alembic for explicit migration flow.
- API responses include `x-request-id` and baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, CSP).
- Structured audit events are emitted via `signflow.audit` logger for model/session/job/export actions.
