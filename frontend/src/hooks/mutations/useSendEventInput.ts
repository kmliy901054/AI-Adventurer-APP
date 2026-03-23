import { queryKeys } from '@/api/queryKeys';
import { postEventInput } from '@/api/postEventInput';
import { useMutation } from '@/hooks/useMutation';
import type { EventInputPayload } from '@/types/game';

export function useSendEventInput() {
  return useMutation({
    mutationFn: (payload: EventInputPayload) => postEventInput(payload),
    invalidateQueryKeys: [queryKeys.currentEvent, queryKeys.eventHistory],
  });
}
