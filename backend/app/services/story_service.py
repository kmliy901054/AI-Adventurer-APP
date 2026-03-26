from app.domain import build_chapter_prompt, build_loop_prompt, resolve_chapter
from app.integrations import OllamaClient
from app.models import StoryResult
from app.services.state_store import store

class StoryService:
    def __init__(self, client: OllamaClient):
        self._client = client

    _fallback_by_chapter = {
        1: "你屏住呼吸，繼續在叢林深處探索。",
        2: "你穩住步伐，在危險的橋面上繼續前行。",
        3: "你咬牙衝刺，在洞穴追逐中尋找生機。",
    }

    def generate(self, payload: dict | None = None) -> StoryResult:
        payload = payload or {}
        chapter = self._sync_chapter(payload)
        template_key = str(payload.get("template_key", f"chapter-{chapter}_story"))

        # 劇情只走 prompt/loop/chapter prompt，不接受事件成敗與外部關鍵字。
        prompt = self._build_prompt(chapter, payload)
        generated_story = None
        if prompt:
            model = payload.get("model")
            generated_story, _upstream_error = self._client.chat(
                prompt=prompt,
                model=str(model) if model else None,
            )

        final_story = generated_story or self._fallback_by_chapter.get(
            chapter,
            self._fallback_by_chapter[1],
        )

        story = StoryResult(
            story_segment=final_story,
            tone="adventure",
            template_key=template_key,
        )
        store.set_story(story)
        return story

    def current(self) -> StoryResult:
        return store.get_story()

    def _sync_chapter(self, payload: dict) -> int:
        state = store.get_game_state()

        if payload.get("reset_chapter"):
            state.chapter_id = "chapter-1"
        elif payload.get("advance_chapter"):
            current = resolve_chapter(state.chapter_id)
            state.chapter_id = f"chapter-{min(3, current + 1)}"

        return resolve_chapter(state.chapter_id)

    def _build_prompt(self, chapter: int, payload: dict) -> str | None:
        if payload.get("prompt"):
            return str(payload["prompt"]).strip()

        if payload.get("loop_id") is not None:
            loop_id = int(payload["loop_id"])
            return build_loop_prompt(loop_id)

        return build_chapter_prompt(chapter)


story_service = StoryService(client=OllamaClient())
