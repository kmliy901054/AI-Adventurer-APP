import { getHealth } from '@/api/getHealth';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useHealth() {
  return useQuery(queryKeys.health, getHealth);
}
