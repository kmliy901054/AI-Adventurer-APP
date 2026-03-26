from flask import Blueprint
from time import time

from app.services import event_service, story_service, store
from app.utils import success

bp = Blueprint("game", __name__, url_prefix="/api/game")

@bp.post("/start")
def start_game():
    store.reset()

    # 先進入 chapter-1 劇情，由 StoryService 管理章節與劇情 prompt。
    story = story_service.generate({"reset_chapter": True})
    state = store.get_game_state()

    # 先顯示劇情 1（10 秒），再由後端 tick 轉入事件固定文字。
    store.schedule_event_spawn(delay_s=10.0)
    
    server_time = time()
    event_end_time = server_time + 10.0
    
    payload = state.to_dict()
    payload["event_end_time"] = event_end_time
    payload["server_time"] = server_time
    
    return success(
        {
            "message": "Game started successfully.",
            "game_state": payload,
            "story": story.to_dict(),
        }
    )


@bp.post("/reset")
def reset_game():
    store.reset()
    return success({"message": "Game state reset."})


@bp.get("/state")
def game_state():
    event_service.process_game_tick()
    state = store.get_game_state()
    server_time = time()
    event_end_time = server_time + max(0, state.time_remaining_ms) / 1000
    payload = state.to_dict()
    payload["event_end_time"] = event_end_time
    payload["server_time"] = server_time
    return success(payload)
