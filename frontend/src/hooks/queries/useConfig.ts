import { getConfig } from '@/api/getConfig';
import { queryKeys } from '@/api/queryKeys';
import { useQuery } from '@/hooks/useQuery';

export function useConfig() {
  return useQuery(queryKeys.config, getConfig);
}
