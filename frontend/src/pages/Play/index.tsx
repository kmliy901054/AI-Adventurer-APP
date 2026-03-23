import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useInjectDemoEvent } from '@/hooks/mutations/useInjectDemoEvent';
import { useGameState } from '@/hooks/queries/useGameState';

const defaultActions = ['stand', 'crouch', 'jump'];

export default function PlayPage() {
  const gameStateQuery = useGameState();
  const injectDemoEventMutation = useInjectDemoEvent();

  const gameState = gameStateQuery.data?.data;
  const [selectedAction, setSelectedAction] = useState(defaultActions[0]);

  const hasEvent = useMemo(() => !!gameState?.event_id, [gameState?.event_id]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Play</h2>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <p>Target Action: {gameState?.target_action ?? '-'}</p>
        <p>Judge Result: {gameState?.judge_result ?? '-'}</p>
        <p>HP: {gameState?.player_state.hp ?? '-'}</p>
        <p>Score: {gameState?.player_state.score ?? '-'}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedAction}
          onChange={(event) => setSelectedAction(event.target.value)}
        >
          {defaultActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <Button
          onClick={() =>
            injectDemoEventMutation.mutate({
              target_action: selectedAction,
            })
          }
        >
          Inject Demo Event
        </Button>
        <Button variant="outline" onClick={() => void gameStateQuery.refetch()}>
          Refresh State
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {hasEvent ? 'Current event is active.' : 'No active event yet.'}
      </p>
    </section>
  );
}
