from app.domain import build_keywords_prompt, build_loop_prompt
from app.integrations import ollama_client
from app.models import StoryResult
from app.services.state_store import store


class StoryService:
    _fallback_templates = {
        "success": "You moved at the perfect moment and break through the obstacle.",
        "fail": "The challenge slips away, but your journey continues.",
        "pending": "A new challenge emerges in front of you.",
    }

    def generate(self, payload: dict) -> StoryResult:
        result_key = str(payload.get("event_result", "pending"))
        template_key = str(payload.get("template_key", f"default_{result_key}"))

        # 支援三種故事來源：手動 prompt、loop_id（對應 notebook）、關鍵詞 + chapter
        prompt = self._build_prompt(payload)
        generated_story = None
        if prompt:
            model = payload.get("model")
            generated_story = ollama_client.chat(prompt=prompt, model=str(model) if model else None)

        story = StoryResult(
            story_segment=generated_story
            or self._fallback_templates.get(result_key, self._fallback_templates["pending"]),
            tone="adventure",
            template_key=template_key,
        )
        store.set_story(story)
        return story

    def current(self) -> StoryResult:
        return store.get_story()

    def _build_prompt(self, payload: dict) -> str | None:
        if payload.get("prompt"):
            return str(payload["prompt"]).strip()

        if payload.get("loop_id") is not None:
            loop_id = int(payload["loop_id"])
            return build_loop_prompt(loop_id)

        if payload.get("keywords"):
            chapter = int(payload.get("chapter", 1))
            return build_keywords_prompt(chapter=chapter, keywords=str(payload["keywords"]))

        if payload.get("template_key", "").startswith("chapter"):
            chapter_guess = 1
            key = str(payload["template_key"])
            if key.startswith("chapter1"):
                chapter_guess = 1
            elif key.startswith("chapter2"):
                chapter_guess = 2
            elif key.startswith("chapter3"):
                chapter_guess = 3

            result = str(payload.get("event_result", "pending"))
            fallback_keywords = f"事件結果: {result}。請接續該章節的冒險敘事。"
            return build_keywords_prompt(chapter_guess, fallback_keywords)

        return None


story_service = StoryService()
