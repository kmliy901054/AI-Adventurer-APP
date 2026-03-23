import { queryKeys } from '@/api/queryKeys';
import { postInjectDemoEvent } from '@/api/postInjectDemoEvent';
import { useMutation } from '@/hooks/useMutation';

export function useInjectDemoEvent() {
  return useMutation({
    mutationFn: (variables: {
      target_action: string;
      time_limit_ms?: number;
    }) => postInjectDemoEvent(variables.target_action, variables.time_limit_ms),
    invalidateQueryKeys: [
      queryKeys.gameState,
      queryKeys.currentEvent,
      queryKeys.eventHistory,
    ],
  });
}
