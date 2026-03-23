import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope } from '@/types/game';

export function getHealth() {
  return apiClient<ApiEnvelope<{ status: string }>>('/api/health');
}
