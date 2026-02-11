from collections import defaultdict, deque
from collections.abc import Awaitable, Callable
from threading import Lock
from time import monotonic

from fastapi import HTTPException, Request


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._events: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str, limit: int, window_seconds: int = 60) -> tuple[bool, int]:
        if limit <= 0:
            return True, 0

        now = monotonic()
        boundary = now - window_seconds

        with self._lock:
            events = self._events[key]
            while events and events[0] <= boundary:
                events.popleft()

            if len(events) >= limit:
                retry_after = max(int(window_seconds - (now - events[0])) + 1, 1)
                return False, retry_after

            events.append(now)
            return True, 0

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


rate_limiter = InMemoryRateLimiter()


def client_identifier(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    if request.client and request.client.host:
        return request.client.host
    return "unknown"


def with_rate_limit(limit_per_minute: int, scope: str) -> Callable[[Request], Awaitable[None]]:
    async def _dependency(request: Request) -> None:
        key = f"{scope}:{client_identifier(request)}"
        allowed, retry_after = rate_limiter.allow(key, limit_per_minute, window_seconds=60)
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="rate_limit_exceeded",
                headers={"Retry-After": str(retry_after)},
            )

    return _dependency
