import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Bug, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import BackHomeButton from '@/components/common/BackHomeButton';
import { useInjectDemoEvent } from '@/hooks/mutations/useInjectDemoEvent';
import { useConfig } from '@/hooks/queries/useConfig';
import { useCurrentEvent } from '@/hooks/queries/useCurrentEvent';
import { useCurrentStory } from '@/hooks/queries/useCurrentStory';
import { useGameState } from '@/hooks/queries/useGameState';
import { useHealth } from '@/hooks/queries/useHealth';
import { API_BASE_URL } from '@/lib/apiClient';

const defaultActions = ['stand', 'crouch', 'jump'];
const maxHp = 3;

export default function Game() {
  const { showDebug } = useOutletContext<{ showDebug: boolean }>();
  const healthQuery = useHealth();
  const configQuery = useConfig();
  const gameStateQuery = useGameState();
  const currentEventQuery = useCurrentEvent();
  const currentStoryQuery = useCurrentStory();
  const injectDemoEventMutation = useInjectDemoEvent();

  const [selectedAction, setSelectedAction] = useState(defaultActions[0]);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const [phaseSyncArmed, setPhaseSyncArmed] = useState(false);
  const lastBoundarySyncAtRef = useRef(0);

  const gameState = gameStateQuery.data?.data;
  const currentEvent = currentEventQuery.data?.data;
  const currentStory = currentStoryQuery.data?.data;
  const currentHp = Math.max(
    0,
    Math.min(maxHp, gameState?.player_state.hp ?? 0)
  );
  const storyText =
    currentStory?.story_segment?.trim() ||
    gameState?.story_segment?.trim() ||
    '等待後端推進劇情...';

  const eventResolved =
    gameState?.judge_result === 'success' || gameState?.judge_result === 'fail';
  const isEventActive = currentEvent?.status === 'active';
  const inEventPhase = isEventActive || eventResolved;
  const phaseLabel = isEventActive
    ? '事件挑戰'
    : eventResolved
      ? '結果回饋'
      : '劇情推進';
  const calibratedNowMs = clockMs + serverOffsetMs;
  const localRemainingMs = Math.max(
    0,
    (gameState?.event_end_time ?? 0) * 1000 - calibratedNowMs
  );

  const phaseTotalMs = isEventActive
    ? (currentEvent?.time_limit_ms ?? 10000)
    : eventResolved
      ? 5000
      : 10000;

  const phaseProgress = Math.max(
    0,
    Math.min(
      100,
      phaseTotalMs > 0 ? (localRemainingMs / phaseTotalMs) * 100 : 0
    )
  );
  const narrativeCardTitle = inEventPhase ? '事件' : '劇情';
  const narrativeText = inEventPhase
    ? gameState?.story_segment?.trim() || '事件即將開始...'
    : storyText;
  const narrativePhaseKey = `${narrativeCardTitle}-${currentEvent?.event_id ?? 'none'}-${gameState?.judge_result ?? 'pending'}`;
  const [renderedNarrative, setRenderedNarrative] = useState({
    key: narrativePhaseKey,
    title: narrativeCardTitle,
    text: narrativeText,
  });
  const [cardAnimClass, setCardAnimClass] = useState('game-card-enter-right');

  const timeLeftSecondsValue = Math.max(0, localRemainingMs / 1000);
  const timeLeftSecondsDisplay = timeLeftSecondsValue.toFixed(1);
  const isEventDangerTime = isEventActive && timeLeftSecondsValue <= 3;

  const cardOutcomeClass =
    eventResolved && gameState?.judge_result === 'success'
      ? 'game-card-success'
      : eventResolved && gameState?.judge_result === 'fail'
        ? 'game-card-fail'
        : '';

  const debugPayload = useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      isBackendReady: healthQuery.data?.data?.status === 'ok',
      config: configQuery.data?.data,
      gameState,
      currentEvent,
      error:
        healthQuery.error?.message ??
        configQuery.error?.message ??
        gameStateQuery.error?.message ??
        currentEventQuery.error?.message ??
        currentStoryQuery.error?.message,
    }),
    [
      configQuery.data?.data,
      configQuery.error?.message,
      currentEvent,
      currentEventQuery.error?.message,
      currentStory,
      currentStoryQuery.error?.message,
      gameState,
      gameStateQuery.error?.message,
      healthQuery.data?.data?.status,
      healthQuery.error?.message,
    ]
  );

  // 本地時鐘：用 server_time 校正後自行更新剩餘時間。
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockMs(Date.now());
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!gameState) {
      return;
    }
    setServerOffsetMs(gameState.server_time * 1000 - Date.now());
  }, [gameState?.server_time]);

  // 到點後改為節流重試同步，避免卡在 0 秒卻沒切到下一輪。
  useEffect(() => {
    if (!gameState) {
      return;
    }

    if (localRemainingMs > 120) {
      if (phaseSyncArmed) {
        setPhaseSyncArmed(false);
      }
      return;
    }

    const nowMs = Date.now();
    const retryGapMs = phaseSyncArmed ? 650 : 0;
    if (nowMs - lastBoundarySyncAtRef.current < retryGapMs) {
      return;
    }

    lastBoundarySyncAtRef.current = nowMs;
    if (!phaseSyncArmed) {
      setPhaseSyncArmed(true);
    }
    void gameStateQuery.refetch();
    void currentEventQuery.refetch();
    void currentStoryQuery.refetch();
  }, [
    gameState,
    localRemainingMs,
    phaseSyncArmed,
    gameStateQuery,
    currentEventQuery,
    currentStoryQuery,
  ]);

  useEffect(() => {
    if (narrativePhaseKey === renderedNarrative.key) {
      setRenderedNarrative((prev) => ({
        ...prev,
        title: narrativeCardTitle,
        text: narrativeText,
      }));
      return;
    }

    setCardAnimClass('game-card-exit-left');
    const timer = window.setTimeout(() => {
      setRenderedNarrative({
        key: narrativePhaseKey,
        title: narrativeCardTitle,
        text: narrativeText,
      });
      setCardAnimClass('game-card-enter-right');
    }, 210);

    return () => clearTimeout(timer);
  }, [
    narrativePhaseKey,
    narrativeCardTitle,
    narrativeText,
    renderedNarrative.key,
  ]);

  return (
    <section className="space-y-5 pb-8">
      <BackHomeButton />
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>鏡頭畫面</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="relative flex h-[min(74vh,700px)] min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/60 bg-[linear-gradient(145deg,hsl(var(--muted)/0.5),hsl(var(--card)))] text-sm text-muted-foreground">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,hsl(var(--primary)/0.2),transparent_38%),radial-gradient(circle_at_78%_80%,hsl(var(--primary)/0.12),transparent_42%)]" />
              TODO: Camera Stream Preview
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-rows-[auto_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>遊戲狀態</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">血量</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {currentHp}/{maxHp}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">分數</p>
                  <p className="text-lg font-semibold tabular-nums">
                    {gameState?.player_state.score ?? '-'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-[11px] text-muted-foreground">章節</p>
                  <p className="text-lg font-semibold">
                    {gameState?.chapter_id ?? '-'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{phaseLabel}</span>
                  <span className="font-semibold tabular-nums">
                    {timeLeftSecondsDisplay}s
                  </span>
                </div>
                <Progress
                  value={phaseProgress}
                  className={
                    isEventDangerTime
                      ? 'h-2 [&_[data-slot=progress-indicator]]:bg-destructive'
                      : 'h-2'
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardAnimClass} ${cardOutcomeClass}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>{renderedNarrative.title}卡</span>
                <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                  {isEventActive ? 'Action' : 'Story'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="min-h-40 rounded-lg border border-border/60 bg-muted/30 p-4 leading-relaxed">
                {renderedNarrative.text}
              </p>

              {isEventActive ? (
                <div className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="text-xs text-muted-foreground">目標動作</p>
                  <p className="mt-1 text-lg font-semibold text-primary">
                    {gameState?.target_action ?? '-'}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {showDebug ? (
        <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,26rem)] rounded-2xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
              <Bug className="size-4 text-amber-500" />
              Debug Panel
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                void gameStateQuery.refetch();
                void currentEventQuery.refetch();
                void currentStoryQuery.refetch();
              }}
            >
              <RefreshCw className="size-4" />
              Sync
            </Button>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <select
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              size="sm"
              onClick={() =>
                injectDemoEventMutation.mutate({
                  target_action: selectedAction,
                })
              }
            >
              Inject
            </Button>
          </div>

          <pre className="max-h-56 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-2 text-[11px] leading-relaxed">
            {JSON.stringify(debugPayload, null, 2)}
          </pre>
        </div>
      ) : null}
    </section>
  );
}
