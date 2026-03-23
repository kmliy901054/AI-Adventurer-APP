import { useMemo } from 'react';

import { useConfig } from '@/hooks/queries/useConfig';
import { useGameState } from '@/hooks/queries/useGameState';
import { useHealth } from '@/hooks/queries/useHealth';
import { API_BASE_URL } from '@/lib/apiClient';

export default function DebugPage() {
  const healthQuery = useHealth();
  const configQuery = useConfig();
  const gameStateQuery = useGameState();

  const config = configQuery.data?.data;
  const gameState = gameStateQuery.data?.data;
  const isBackendReady = healthQuery.data?.data.status === 'ok';
  const error =
    healthQuery.error?.message ??
    configQuery.error?.message ??
    gameStateQuery.error?.message;

  const debugPayload = useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      isBackendReady,
      config,
      gameState,
      error,
    }),
    [config, error, gameState, isBackendReady]
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Debug</h2>
      <pre className="overflow-auto rounded-xl border border-border bg-card p-4 text-xs">
        {JSON.stringify(debugPayload, null, 2)}
      </pre>
    </section>
  );
}
