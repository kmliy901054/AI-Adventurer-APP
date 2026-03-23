import { queryKeys } from '@/api/queryKeys';
import { postStartGame } from '@/api/postStartGame';
import { useMutation } from '@/hooks/useMutation';

export function useStartGame() {
  return useMutation({
    mutationFn: postStartGame,
    invalidateQueryKeys: [queryKeys.gameState],
  });
}
