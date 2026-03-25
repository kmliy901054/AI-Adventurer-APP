from flask import Blueprint, request

from app.services import llm_service
from app.utils import failure, success

bp = Blueprint("llm", __name__, url_prefix="/api/llm")


@bp.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    result, error = llm_service.chat(payload)
    if error is not None:
        details: dict[str, object] = {}
        code = error.get("code")
        if code is not None:
            details["code"] = code

        extra = error.get("details")
        if isinstance(extra, dict):
            details.update(extra)
        elif extra is not None:
            details["info"] = extra

        return failure(
            str(error.get("message", "LLM service unavailable.")),
            status_code=int(error.get("status_code", 503)),
            details=details or None,
        )

    return success(result)
