from flask import Blueprint

from app.services import system_service
from app.utils import success

bp = Blueprint("system", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    return success({"status": "ok"})


@bp.get("/config")
def config():
    return success(system_service.read_public_config())
