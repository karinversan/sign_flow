import redis

from app.config import settings


def redis_client() -> redis.Redis:
    return redis.Redis.from_url(settings.redis_url, decode_responses=True)


def enqueue_inference_job(job_id: str) -> None:
    client = redis_client()
    client.rpush(settings.jobs_queue_name, job_id)


def dequeue_inference_job(timeout_seconds: int | None = None) -> str | None:
    client = redis_client()
    timeout = timeout_seconds if timeout_seconds is not None else settings.worker_queue_pop_timeout_seconds
    item = client.blpop(settings.jobs_queue_name, timeout=max(timeout, 1))
    if not item:
        return None
    _, value = item
    return value


def clear_inference_queue() -> None:
    client = redis_client()
    client.delete(settings.jobs_queue_name)
