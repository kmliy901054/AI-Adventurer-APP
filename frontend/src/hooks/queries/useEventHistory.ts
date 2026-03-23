import { getEventHistory } from '@/api/getEventHistory';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useEventHistory() {
  return useQuery(queryKeys.eventHistory, getEventHistory);
}
