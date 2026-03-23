import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, StoryResult } from '@/types/game';

export function getCurrentStory() {
  return apiClient<ApiEnvelope<StoryResult>>('/api/story/current');
}
