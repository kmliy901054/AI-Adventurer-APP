import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope } from '@/types/game';

export function getConfig() {
  return apiClient<ApiEnvelope<Record<string, string>>>('/api/config');
}
