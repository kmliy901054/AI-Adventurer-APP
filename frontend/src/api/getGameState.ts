import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, GameStateSnapshot } from '@/types/game';

export function getGameState() {
  return apiClient<ApiEnvelope<GameStateSnapshot>>('/api/game/state');
}
