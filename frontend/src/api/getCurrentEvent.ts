import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, EventRecord } from '@/types/game';

export function getCurrentEvent() {
  return apiClient<ApiEnvelope<EventRecord | null>>('/api/events/current');
}
