import { apiClient } from '@/lib/apiClient';
import type {
  ApiEnvelope,
  StoryGeneratePayload,
  StoryResult,
} from '@/types/game';

export function postGenerateStory(payload: StoryGeneratePayload) {
  return apiClient<ApiEnvelope<StoryResult>>('/api/story/generate', {
    method: 'POST',
    body: payload,
  });
}
