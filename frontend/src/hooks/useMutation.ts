import {
  useMutation as useTanStackMutation,
  useQueryClient,
  type MutationFunction,
  type QueryKey,
} from '@tanstack/react-query';
import { toast } from 'sonner';

type MutationContext = {
  toastId?: string | number;
};

type UseMutationOptions<TData, TVariables, TError = Error> = {
  mutationFn: MutationFunction<TData, TVariables>;
  invalidateQueryKeys?: QueryKey[];
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: MutationContext | undefined
  ) => void | Promise<void>;
  onError?: (
    error: TError,
    variables: TVariables,
    context: MutationContext | undefined
  ) => void | Promise<void>;
};

function getMessageFromData(data: unknown) {
  if (data && typeof data === 'object' && 'message' in data) {
    const maybeMessage = (data as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage;
    }
  }

  return undefined;
}

function getMessageFromError(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return '發生錯誤，請稍後再試。';
}

export function useMutation<TData, TVariables, TError = Error>(
  options: UseMutationOptions<TData, TVariables, TError>
) {
  const queryClient = useQueryClient();
  const showLoadingToast = options.showLoadingToast ?? false;
  const showSuccessToast = options.showSuccessToast ?? false;
  const showErrorToast = options.showErrorToast ?? false;

  return useTanStackMutation<
    TData,
    TError,
    TVariables,
    MutationContext | undefined
  >({
    mutationFn: options.mutationFn,
    onMutate: async () => {
      if (showLoadingToast) {
        return {
          toastId: toast.loading(options.loadingMessage ?? '載入中...'),
        };
      }

      return undefined;
    },
    onSuccess: async (
      data: TData,
      variables: TVariables,
      context: MutationContext | undefined
    ) => {
      if (options.invalidateQueryKeys?.length) {
        await Promise.all(
          options.invalidateQueryKeys.map((queryKey) =>
            queryClient.invalidateQueries({ queryKey })
          )
        );
      }

      if (showSuccessToast) {
        toast.success('Success', {
          description: options.successMessage ?? getMessageFromData(data),
        });
      }

      await options.onSuccess?.(data, variables, context);
    },
    onError: async (
      error: TError,
      variables: TVariables,
      context: MutationContext | undefined
    ) => {
      if (showErrorToast) {
        toast.error('Error', {
          description: options.errorMessage ?? getMessageFromError(error),
        });
      }

      await options.onError?.(error, variables, context);
    },
    onSettled: async (
      _data: TData | undefined,
      _error: TError | null,
      _variables: TVariables,
      context: MutationContext | undefined
    ) => {
      if (showLoadingToast && context?.toastId) {
        toast.dismiss(context.toastId);
      }
    },
  });
}
