import { queryKeys } from '@/api/queryKeys';
import { postResetGame } from '@/api/postResetGame';
import { useMutation } from '@/hooks/useMutation';

export function useResetGame() {
  return useMutation({
    mutationFn: postResetGame,
    invalidateQueryKeys: [
      queryKeys.gameState,
      queryKeys.currentEvent,
      queryKeys.eventHistory,
      queryKeys.currentStory,
    ],
  });
}
