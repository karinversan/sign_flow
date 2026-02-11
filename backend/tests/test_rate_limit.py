from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.security import rate_limiter, with_rate_limit


def test_rate_limit_blocks_after_threshold():
    rate_limiter.reset()

    app = FastAPI()

    @app.get("/limited", dependencies=[Depends(with_rate_limit(2, "test:limited"))])
    def limited():
        return {"ok": True}

    client = TestClient(app)

    first = client.get("/limited")
    second = client.get("/limited")
    third = client.get("/limited")

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
    assert third.json()["detail"] == "rate_limit_exceeded"
    assert int(third.headers["Retry-After"]) >= 1


def test_rate_limit_uses_forwarded_for_header():
    rate_limiter.reset()

    app = FastAPI()

    @app.get("/limited", dependencies=[Depends(with_rate_limit(1, "test:forwarded"))])
    def limited():
        return {"ok": True}

    client = TestClient(app)

    first_ip_ok = client.get("/limited", headers={"x-forwarded-for": "10.0.0.1"})
    second_ip_ok = client.get("/limited", headers={"x-forwarded-for": "10.0.0.2"})
    first_ip_blocked = client.get("/limited", headers={"x-forwarded-for": "10.0.0.1"})

    assert first_ip_ok.status_code == 200
    assert second_ip_ok.status_code == 200
    assert first_ip_blocked.status_code == 429
