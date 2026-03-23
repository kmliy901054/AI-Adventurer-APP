import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope } from '@/types/game';

export function postResetGame() {
  return apiClient<ApiEnvelope<{ message: string }>>('/api/game/reset', {
    method: 'POST',
  });
}
