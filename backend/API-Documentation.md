# API Documentation

本文件描述目前 backend 已提供的 API 端點。

- Base URL: `http://localhost:8000`
- Content-Type: `application/json`
- 回應包裝格式：

```json
{
  "success": true,
  "data": {}
}
```

失敗時：

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": {}
  }
}
```

## 1. GET /api/health

### Purpose

確認後端服務是否可用。

### Request

- Method: `GET`
- Path: `/api/health`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若服務未啟動，會發生連線失敗。

### Example

```bash
curl -X GET http://localhost:8000/api/health
```

## 2. GET /api/config

### Purpose

取得可公開的系統設定（提供前端顯示/連線資訊）。

### Request

- Method: `GET`
- Path: `/api/config`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "app_env": "development",
    "api_base_url": "http://localhost:8000",
    "edge_gateway_url": "ws://localhost:9000/events",
    "llm_model": "gpt-4.1-mini"
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若設定值格式錯誤可能導致 `500`。

### Example

```bash
curl -X GET http://localhost:8000/api/config
```

## 3. POST /api/game/start

### Purpose

初始化或啟動遊戲流程（目前為骨架版，設定初始劇情文字）。

### Request

- Method: `POST`
- Path: `/api/game/start`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "message": "Game lifecycle endpoint is ready. Core game logic is not enabled yet.",
    "game_state": {
      "chapter_id": "chapter-1",
      "event_id": null,
      "target_action": null,
      "time_remaining_ms": 0,
      "judge_result": "pending",
      "player_state": {
        "hp": 3,
        "score": 0
      },
      "story_segment": "The adventure begins."
    }
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若內部狀態讀寫失敗可能回傳 `500`。

### Example

```bash
curl -X POST http://localhost:8000/api/game/start
```

## 4. POST /api/game/reset

### Purpose

重置遊戲與事件暫存狀態。

### Request

- Method: `POST`
- Path: `/api/game/reset`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "message": "Game state reset."
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若內部狀態重置失敗可能回傳 `500`。

### Example

```bash
curl -X POST http://localhost:8000/api/game/reset
```

## 5. GET /api/game/state

### Purpose

取得目前遊戲狀態。

### Request

- Method: `GET`
- Path: `/api/game/state`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "chapter_id": "chapter-1",
    "event_id": "f8e3fbe0-6b0d-4f95-b447-8a3a4043dd9a",
    "target_action": "stand",
    "time_remaining_ms": 10000,
    "judge_result": "pending",
    "player_state": {
      "hp": 3,
      "score": 0
    },
    "story_segment": "Ready for adventure."
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若內部狀態讀取失敗可能回傳 `500`。

### Example

```bash
curl -X GET http://localhost:8000/api/game/state
```

## 6. POST /api/game/demo-event

### Purpose

注入一筆 demo 事件，快速建立可測試的 target action 與 event 狀態。

### Request

- Method: `POST`
- Path: `/api/game/demo-event`
- Body (optional):

```json
{
  "target_action": "stand",
  "time_limit_ms": 10000
}
```

若未提供，預設：

- `target_action = "stand"`
- `time_limit_ms = 10000`

### Success

- Status: `201`
- Body:

```json
{
  "success": true,
  "data": {
    "message": "Demo event injected.",
    "event": {
      "event_id": "f8e3fbe0-6b0d-4f95-b447-8a3a4043dd9a",
      "target_action": "stand",
      "time_limit_ms": 10000,
      "status": "active",
      "created_at": 1711111111.123
    },
    "game_state": {
      "chapter_id": "chapter-1",
      "event_id": "f8e3fbe0-6b0d-4f95-b447-8a3a4043dd9a",
      "target_action": "stand",
      "time_remaining_ms": 10000,
      "judge_result": "pending",
      "player_state": {
        "hp": 3,
        "score": 0
      },
      "story_segment": "Ready for adventure."
    }
  }
}
```

### Errors

- 若 `time_limit_ms` 無法轉為整數，可能觸發 `500`。
- 其他未預期例外可能回傳 `500`。

### Example

```bash
curl -X POST http://localhost:8000/api/game/demo-event \
  -H "Content-Type: application/json" \
  -d '{"target_action":"jump","time_limit_ms":8000}'
```

## 7. POST /api/events/input

### Purpose

接收 Edge 偵測事件輸入，保存到事件輸入緩衝。

### Request

- Method: `POST`
- Path: `/api/events/input`
- Body (required fields):

```json
{
  "timestamp": 1711111111.123,
  "action_scores": {
    "stand": 0.12,
    "crouch": 0.05,
    "jump": 0.83
  },
  "stable_action": "jump"
}
```

### Success

- Status: `201`
- Body:

```json
{
  "success": true,
  "data": {
    "timestamp": 1711111111.123,
    "action_scores": {
      "stand": 0.12,
      "crouch": 0.05,
      "jump": 0.83
    },
    "stable_action": "jump"
  }
}
```

### Errors

- Status: `422`（缺少必要欄位）

```json
{
  "success": false,
  "error": {
    "message": "Missing required fields",
    "details": {
      "missing": ["timestamp", "action_scores"]
    }
  }
}
```

- 若欄位型別不合法（例如 `timestamp` 無法轉數字），可能觸發 `500`。

### Example

```bash
curl -X POST http://localhost:8000/api/events/input \
  -H "Content-Type: application/json" \
  -d '{"timestamp":1711111111.123,"action_scores":{"jump":0.9},"stable_action":"jump"}'
```

## 8. GET /api/events/current

### Purpose

取得目前 active 的事件。

### Request

- Method: `GET`
- Path: `/api/events/current`
- Body: 無

### Success

- Status: `200`
- 若有 active event：

```json
{
  "success": true,
  "data": {
    "event_id": "f8e3fbe0-6b0d-4f95-b447-8a3a4043dd9a",
    "target_action": "stand",
    "time_limit_ms": 10000,
    "status": "active",
    "created_at": 1711111111.123
  }
}
```

- 若目前沒有事件：

```json
{
  "success": true,
  "data": null
}
```

### Errors

- 一般情況無預期業務錯誤。

### Example

```bash
curl -X GET http://localhost:8000/api/events/current
```

## 9. GET /api/events/history

### Purpose

取得事件歷史列表。

### Request

- Method: `GET`
- Path: `/api/events/history`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": [
    {
      "event_id": "f8e3fbe0-6b0d-4f95-b447-8a3a4043dd9a",
      "target_action": "stand",
      "time_limit_ms": 10000,
      "status": "active",
      "created_at": 1711111111.123
    }
  ]
}
```

### Errors

- 一般情況無預期業務錯誤。

### Example

```bash
curl -X GET http://localhost:8000/api/events/history
```

## 10. POST /api/story/generate

### Purpose

依照事件結果產生劇情文字（目前使用 fallback template）。

### Request

- Method: `POST`
- Path: `/api/story/generate`
- Body (optional):

```json
{
  "event_result": "success",
  "template_key": "chapter1_success"
}
```

- `event_result` 支援：`success | fail | pending`
- 若省略，預設 `pending`

### Success

- Status: `201`
- Body:

```json
{
  "success": true,
  "data": {
    "story_segment": "You moved at the perfect moment and break through the obstacle.",
    "tone": "adventure",
    "template_key": "chapter1_success"
  }
}
```

### Errors

- 一般情況無預期業務錯誤。
- 若 payload 結構異常導致內部處理失敗，可能回傳 `500`。

### Example

```bash
curl -X POST http://localhost:8000/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{"event_result":"fail","template_key":"chapter1_fail"}'
```

## 11. GET /api/story/current

### Purpose

取得目前儲存中的劇情內容。

### Request

- Method: `GET`
- Path: `/api/story/current`
- Body: 無

### Success

- Status: `200`
- Body:

```json
{
  "success": true,
  "data": {
    "story_segment": "Adventure has not started yet.",
    "tone": "adventure",
    "template_key": "default_idle"
  }
}
```

### Errors

- 一般情況無預期業務錯誤。

### Example

```bash
curl -X GET http://localhost:8000/api/story/current
```
