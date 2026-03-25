from app.config import get_config
from app.integrations import ollama_client


class LLMService:
    def chat(self, payload: dict) -> tuple[dict[str, str] | None, dict[str, object] | None]:
        message = str(payload.get("message", "")).strip()
        raw_messages = payload.get("messages")
        message_history: list[dict[str, str]] = []
        if isinstance(raw_messages, list):
            for item in raw_messages:
                if not isinstance(item, dict):
                    continue
                role = str(item.get("role", "")).strip().lower()
                content = str(item.get("content", "")).strip()
                if role not in {"system", "user", "assistant"}:
                    continue
                if not content:
                    continue
                message_history.append({"role": role, "content": content})

        if not message and not message_history:
            return None, {
                "code": "missing_input",
                "status_code": 422,
                "message": "Field 'message' or 'messages' is required.",
                "details": {"missing": ["message", "messages"]},
            }

        model = payload.get("model")
        selected_model = str(model).strip() if model else get_config().llm_model
        if not selected_model:
            return None, {
                "code": "invalid_model",
                "status_code": 422,
                "message": "Field 'model' cannot be empty.",
                "details": {"field": "model"},
            }

        system_prompt = payload.get("system_prompt")
        selected_system_prompt = str(system_prompt).strip() if system_prompt else None

        reply, upstream_error = ollama_client.chat_detailed(
            prompt=message,
            model=selected_model,
            system_prompt=selected_system_prompt,
            messages=message_history or None,
        )
        if not reply:
            return None, self._map_upstream_error(upstream_error, selected_model)

        return (
            {
                "reply": reply,
                "model": selected_model,
            },
            None,
        )

    def _map_upstream_error(
        self,
        error: dict[str, object] | None,
        model: str,
    ) -> dict[str, object]:
        if not error:
            return {
                "code": "llm_unavailable",
                "status_code": 503,
                "message": "LLM service unavailable.",
            }

        code = str(error.get("code", "llm_unavailable"))
        if code == "upstream_timeout":
            return {
                "code": "llm_timeout",
                "status_code": 504,
                "message": "LLM response timeout.",
            }

        if code == "upstream_connection_error":
            return {
                "code": "llm_connection_error",
                "status_code": 503,
                "message": "Unable to reach Ollama service.",
                "details": {"reason": error.get("reason")},
            }

        if code == "upstream_http_error":
            http_status = int(error.get("http_status", 500))
            if http_status == 404:
                return {
                    "code": "model_not_found",
                    "status_code": 422,
                    "message": "Specified model is not available on Ollama.",
                    "details": {"model": model},
                }

            return {
                "code": "upstream_http_error",
                "status_code": 502,
                "message": "Ollama returned an upstream HTTP error.",
                "details": {"http_status": http_status},
            }

        if code in {"upstream_invalid_response", "upstream_empty_response"}:
            return {
                "code": "upstream_invalid_response",
                "status_code": 502,
                "message": "Ollama returned an invalid response.",
            }

        return {
            "code": "llm_unavailable",
            "status_code": 503,
            "message": "LLM service unavailable.",
        }


llm_service = LLMService()
