from .events import bp as events_bp
from .game import bp as game_bp
from .llm import bp as llm_bp
from .story import bp as story_bp
from .system import bp as system_bp

__all__ = [
	"system_bp",
	"game_bp",
	"events_bp",
	"llm_bp",
	"story_bp",
]
