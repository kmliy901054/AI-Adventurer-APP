import { queryKeys } from '@/api/queryKeys';
import { postGenerateStory } from '@/api/postGenerateStory';
import { useMutation } from '@/hooks/useMutation';
import type { StoryGeneratePayload } from '@/types/game';

export function useGenerateStory() {
  return useMutation({
    mutationFn: (payload: StoryGeneratePayload) => postGenerateStory(payload),
    invalidateQueryKeys: [queryKeys.currentStory, queryKeys.gameState],
  });
}
