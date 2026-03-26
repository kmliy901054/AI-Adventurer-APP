# AI-Adventurer Backend

本目錄為 AI-Adventurer 後端 API 服務，負責系統狀態、遊戲狀態、事件輸入判定、劇情生成，以及 Edge 裝置資料接收（REST + WebSocket / Socket.IO）。

## 1. 技術棧

- Python 3.12+
- Flask 3
- flask-cors
- Flask-SocketIO
- Ollama（外部 LLM）
- uv（套件管理與執行）
- pytest（測試）

## 2. 專案結構

```text
backend/
├── app.py                  # 後端入口
├── pyproject.toml
├── uv.lock
├── app/
│   ├── config.py           # 環境變數與設定
│   ├── models.py           # 資料模型
│   ├── websocket.py        # SocketIO 事件處理
│   ├── routes/             # API 路由層（Blueprint）
│   ├── services/           # 應用服務層
│   ├── middleware/         # 中間件
│   ├── utils/              # 共用工具（logger/response）
│   ├── domain/             # 遊戲規則、事件資料、prompt 組裝
│   └── integrations/       # 外部整合（Ollama）
└── tests/
```

## 3. 架構說明

- 入口：app.py 建立 Flask app，註冊 blueprint，並初始化 SocketIO。
- 分層：routes -> services -> domain/integrations -> store/models。
- 狀態：使用 in-memory store 保存遊戲狀態、當前事件、事件歷史與當前劇情。
- 事件判定：由後端事件狀態機自動推進（固定事件池與倒數/結算流程）。
- 劇情生成：StoryService 組裝 prompt 並呼叫 Ollama；失敗時回退到 fallback 模板。
- Edge 流程：
  1. Jetson 送出動作資料到 /edge/frames（SocketIO 或 HTTP）。
  2. edge_service 進行欄位與數值驗證。
  3. 更新最新幀快取與設備狀態。
  4. 前端可透過 REST 查詢或後續擴充即時廣播使用。

## 4. 開發與啟動

在 backend 目錄執行：

```bash
uv sync --dev
uv run app.py
```

啟動後預設監聽：

- REST: http://localhost:8000
- Socket.IO: 同一個服務埠（8000）

## 5. Docker 啟動

在專案根目錄執行：

```bash
docker compose up --build -d
```

服務預設：

- backend: http://localhost:8000
- frontend: http://localhost:8080

## 6. 環境變數

| 變數             | 說明                      | 預設值                     |
| ---------------- | ------------------------- | -------------------------- |
| APP_ENV          | 執行環境                  | development                |
| BACKEND_HOST     | 後端 host                 | 0.0.0.0                    |
| BACKEND_PORT     | 後端 port                 | 8000                       |
| API_BASE_URL     | 對外 API 基底網址         | http://localhost:8000      |
| EDGE_GATEWAY_URL | Edge 事件來源（預留）     | ws://localhost:9000/events |
| OLLAMA_BASE_URL  | Ollama 服務 URL           | http://localhost:11434     |
| OLLAMA_TIMEOUT_S | Ollama 請求 timeout（秒） | 20                         |
| LLM_MODEL        | 預設敘事模型              | qwen3.5:latest             |
| LOG_LEVEL        | 日誌等級                  | INFO                       |
| CORS_ORIGINS     | 允許前端來源（逗號分隔）  | \*                         |

## 7. API 端點

### 7.1 System

- GET /api/health
- GET /api/config

### 7.2 Game

- POST /api/game/start
- POST /api/game/reset
- GET /api/game/state

### 7.3 Events

- GET /api/events/current
- GET /api/events/history

### 7.4 Story

- POST /api/story/generate
- GET /api/story/current

### 7.5 Edge REST

- POST /edge/frames
- GET /edge/frames/latest
- GET /edge/frames/latest/<source>
- GET /edge/devices
- GET /edge/devices/<source>
- GET /edge/stats

## 8. Socket.IO 事件

### 8.1 Namespace: /edge/frames

- connect: 設備連線
- disconnect: 設備斷線
- frame: 傳送 Jetson 幀資料
- response: 伺服器回覆

### 8.2 Namespace: /edge/video

- connect: WebRTC 信令通道建立
- disconnect: 信令通道斷線
- offer: 傳送 SDP Offer
- answer: 傳送 SDP Answer
- candidate: 傳送 ICE Candidate

## 9. Edge 資料驗證規則

POST /edge/frames 與 frame 事件會驗證：

- 必要欄位完整性
- action_scores 格式與數值範圍（0.0-1.0）
- skeleton_sequence.shape 與 frames 維度一致性
- timestamp、frame_id 類型

## 10. 測試方式

執行後端測試：

```bash
uv run pytest -q
```

執行 Edge API 測試：

```bash
uv run python test_edge_api.py
```

快速檢查：

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/edge/devices
```
