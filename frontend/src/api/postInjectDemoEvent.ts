import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, GameState } from '@/types/game';

export function postInjectDemoEvent(
  target_action: string,
  time_limit_ms = 10000
) {
  return apiClient<
    ApiEnvelope<{ message: string; event: unknown; game_state: GameState }>
  >('/api/game/demo-event', {
    method: 'POST',
    body: {
      target_action,
      time_limit_ms,
    },
  });
}
