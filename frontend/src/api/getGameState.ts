import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, GameState } from '@/types/game';

export function getGameState() {
  return apiClient<ApiEnvelope<GameState>>('/api/game/state');
}
