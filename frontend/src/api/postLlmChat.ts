import { apiClient } from '@/lib/apiClient';
import type { ApiEnvelope, LlmChatPayload, LlmChatResult } from '@/types/game';

export function postLlmChat(payload: LlmChatPayload, signal?: AbortSignal) {
  return apiClient<ApiEnvelope<LlmChatResult>>('/api/llm/chat', {
    method: 'POST',
    body: payload,
    signal,
  });
}
