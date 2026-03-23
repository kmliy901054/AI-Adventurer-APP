import { getGameState } from '@/api/getGameState';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useGameState() {
  return useQuery(queryKeys.gameState, getGameState);
}
