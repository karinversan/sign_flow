import json
import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import Request


logger = logging.getLogger("signflow.audit")


def audit_log(action: str, request: Request | None = None, **fields: Any) -> None:
    payload: dict[str, Any] = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "action": action,
        **fields,
    }
    if request is not None:
        payload["request_id"] = getattr(request.state, "request_id", None)
        payload["path"] = request.url.path
        payload["method"] = request.method
        payload["client_ip"] = request.client.host if request.client else None
    logger.info(json.dumps(payload, ensure_ascii=True, sort_keys=True))
