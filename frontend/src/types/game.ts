export type JudgeResult = 'pending' | 'success' | 'fail';

export interface PlayerState {
  hp: number;
  score: number;
}

export interface GameState {
  chapter_id: string;
  event_id: string | null;
  target_action: string | null;
  time_remaining_ms: number;
  judge_result: JudgeResult;
  player_state: PlayerState;
  story_segment: string;
}

export interface EventInputPayload {
  timestamp: number;
  action_scores: Record<string, number>;
  stable_action?: string;
}

export interface EventRecord {
  event_id: string;
  target_action: string;
  time_limit_ms: number;
  status: string;
  created_at: number;
}

export interface StoryResult {
  story_segment: string;
  tone: string;
  template_key: string;
}

export interface StoryGeneratePayload {
  event_result?: JudgeResult;
  template_key?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}
