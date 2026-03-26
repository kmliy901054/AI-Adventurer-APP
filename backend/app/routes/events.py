from flask import Blueprint

from app.services import event_service
from app.utils import success

bp = Blueprint("events", __name__, url_prefix="/api/events")


@bp.get("/current")
def current_event():
    event = event_service.current_event()
    if event is None:
        return success(None)
    return success(event.to_dict())


@bp.get("/history")
def history():
    items = [item.to_dict() for item in event_service.history()]
    return success(items)
