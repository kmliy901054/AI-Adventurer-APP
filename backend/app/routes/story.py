from flask import Blueprint, request

from app.services.story_service import story_service
from app.utils.responses import success

bp = Blueprint("story", __name__, url_prefix="/api/story")


@bp.post("/generate")
def generate_story():
    payload = request.get_json(silent=True) or {}
    story = story_service.generate(payload)
    return success(story.to_dict(), status_code=201)


@bp.get("/current")
def current_story():
    return success(story_service.current().to_dict())
