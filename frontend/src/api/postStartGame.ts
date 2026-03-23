import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, GameState } from '@/types/game';

export function postStartGame() {
  return apiClient<ApiEnvelope<{ message: string; game_state: GameState }>>(
    '/api/game/start',
    {
      method: 'POST',
    }
  );
}
