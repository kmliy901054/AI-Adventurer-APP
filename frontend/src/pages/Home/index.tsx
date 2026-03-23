import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useStartGame } from '@/hooks/mutations/useStartGame';
import { useConfig } from '@/hooks/queries/useConfig';
import { useHealth } from '@/hooks/queries/useHealth';

export default function HomePage() {
  const healthQuery = useHealth();
  const configQuery = useConfig();
  const startGameMutation = useStartGame();

  const isLoading = healthQuery.isLoading || configQuery.isLoading;
  const isBackendReady = healthQuery.data?.data.status === 'ok';
  const appEnv = configQuery.data?.data.app_env ?? 'unknown';
  const error = healthQuery.error?.message ?? configQuery.error?.message;

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI-Adventurer</h1>
        <p className="text-muted-foreground">
          前端基礎架構已建立，並可連接後端健康檢查與設定端點。
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Backend Status</p>
          <p className="text-lg font-semibold">
            {isLoading ? 'checking...' : isBackendReady ? 'online' : 'offline'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">APP_ENV</p>
          <p className="text-lg font-semibold">{appEnv}</p>
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => startGameMutation.mutate(undefined)}>
          Start (API)
        </Button>
        <Button variant="outline" asChild>
          <Link to="/play">Go Play</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/debug">Open Debug</Link>
        </Button>
      </div>
    </section>
  );
}
