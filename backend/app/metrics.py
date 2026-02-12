import time

from fastapi import FastAPI, Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

REQUEST_COUNT = Counter(
    "signflow_http_requests_total",
    "Total HTTP requests",
    ["method", "path", "status_code"],
)
REQUEST_LATENCY = Histogram(
    "signflow_http_request_latency_seconds",
    "HTTP request latency in seconds",
    ["method", "path"],
)
JOB_PROCESS_COUNT = Counter(
    "signflow_job_process_total",
    "Total processed jobs by outcome",
    ["outcome"],
)
JOB_PROCESS_LATENCY = Histogram(
    "signflow_job_process_latency_seconds",
    "Job processing latency in seconds",
    ["outcome"],
)


def observe_job_processing(outcome: str, elapsed_seconds: float) -> None:
    JOB_PROCESS_COUNT.labels(outcome).inc()
    JOB_PROCESS_LATENCY.labels(outcome).observe(max(elapsed_seconds, 0.0))


def install_metrics(app: FastAPI) -> None:
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        path = request.url.path
        REQUEST_COUNT.labels(request.method, path, str(response.status_code)).inc()
        REQUEST_LATENCY.labels(request.method, path).observe(elapsed)
        return response

    @app.get("/metrics", include_in_schema=False)
    def metrics():
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
