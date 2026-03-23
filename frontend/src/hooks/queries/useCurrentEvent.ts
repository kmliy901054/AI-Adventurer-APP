import { getCurrentEvent } from '@/api/getCurrentEvent';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useCurrentEvent() {
  return useQuery(queryKeys.currentEvent, getCurrentEvent);
}
