import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, EventRecord } from '@/types/game';

export function getEventHistory() {
  return apiClient<ApiEnvelope<EventRecord[]>>('/api/events/history');
}
