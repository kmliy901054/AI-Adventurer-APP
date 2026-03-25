from uuid import uuid4

from app.domain import evaluate_required_action, infer_player_action, pick_event, resolve_chapter
from app.models import EdgeInputEvent, EventRecord
from app.services.state_store import store


class EventService:
    def ingest_edge_input(self, payload: dict) -> EdgeInputEvent:
        event = EdgeInputEvent(
            timestamp=float(payload["timestamp"]),
            action_scores=dict(payload["action_scores"]),
            stable_action=payload.get("stable_action"),
        )
        store.append_edge_input(event)

        current = store.get_current_event()
        if current and current.status == "active":
            player_action = infer_player_action(event.stable_action, event.action_scores)
            result = evaluate_required_action(current.target_action, player_action)

            state = store.get_game_state()
            state.judge_result = result
            if result == "success":
                state.player_state.score += 10
            else:
                state.player_state.hp = max(0, state.player_state.hp - 1)
                state.player_state.score -= 10

            current.status = "resolved"

        return event

    def create_demo_event(self, target_action: str, time_limit_ms: int = 10000) -> EventRecord:
        state = store.get_game_state()

        # 支援 target_action="auto"，依目前章節抽取 notebook 對應事件。
        if target_action == "auto":
            chapter = resolve_chapter(state.chapter_id)
            event_def = pick_event(chapter)
            target_action = str(event_def["required_action"])
            time_limit_ms = int(float(event_def["time_limit"]) * 1000)

        event = EventRecord(
            event_id=str(uuid4()),
            target_action=target_action,
            time_limit_ms=time_limit_ms,
            status="active",
        )
        store.set_current_event(event)

        state.event_id = event.event_id
        state.target_action = target_action
        state.time_remaining_ms = time_limit_ms
        state.judge_result = "pending"

        return event

    def current_event(self) -> EventRecord | None:
        return store.get_current_event()

    def history(self) -> list[EventRecord]:
        return store.get_event_history()


event_service = EventService()
