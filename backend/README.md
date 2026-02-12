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

## Important notes

- This is phase-1 backend scaffolding, not full production inference.
- The model provider is currently stub-only and can be replaced with HF provider later.
- API still creates tables at startup for local bootstrap; use Alembic for explicit migration flow.
