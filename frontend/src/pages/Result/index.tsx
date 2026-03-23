import { Button } from '@/components/ui/button';
import { useGenerateStory } from '@/hooks/mutations/useGenerateStory';
import { useGameState } from '@/hooks/queries/useGameState';

export default function ResultPage() {
  const gameStateQuery = useGameState();
  const generateStoryMutation = useGenerateStory();
  const gameState = gameStateQuery.data?.data;

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Result</h2>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Story Segment</p>
        <p className="mt-2 text-base">
          {gameState?.story_segment ?? 'No story yet.'}
        </p>
      </div>

      <Button
        onClick={() =>
          generateStoryMutation.mutate({
            event_result: 'success',
            template_key: 'chapter1_success',
          })
        }
      >
        Generate Success Story (Fallback)
      </Button>
    </section>
  );
}
