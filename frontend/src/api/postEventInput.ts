import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, EventInputPayload } from '@/types/game';

export function postEventInput(payload: EventInputPayload) {
  return apiClient<ApiEnvelope<EventInputPayload>>('/api/events/input', {
    method: 'POST',
    body: payload,
  });
}
