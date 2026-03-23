import {
  useQuery as useTanStackQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query';

type UseGetQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
>;

// 封裝 GET 查詢行為，統一 query key 與 query function 的使用方式。
export function useQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseGetQueryOptions<TData>
) {
  return useTanStackQuery<TData, Error>({
    queryKey,
    queryFn,
    ...options,
  });
}
