import { getCurrentStory } from '@/api/getCurrentStory';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useCurrentStory() {
  return useQuery(queryKeys.currentStory, getCurrentStory);
}
