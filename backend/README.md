# AI-Adventurer Backend

本目錄為 AI-Adventurer 後端 API 服務，負責系統狀態、遊戲狀態、事件輸入判定與劇情生成。

## 1. 技術棧

- Python 3.12+
- Flask 3
- flask-cors
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
│   ├── routes/             # API 路由層（Blueprint）
│   ├── services/           # 應用服務層
│   ├── middleware/         # 中間件
│   ├── utils/              # 共用工具（logger/response）
│   ├── domain/             # 遊戲規則、事件資料、prompt 組裝
│   └── integrations/       # 外部整合（Ollama）
└── tests/
```

## 3. 架構說明

- 入口：`app.py` 建立 Flask app，透過 `app.routes.__init__` 匯出的 blueprint 註冊路由。
- 分層：`routes -> services -> domain/integrations -> store/models`。
- 狀態：使用 in-memory store 保存遊戲狀態、當前事件、事件歷史與當前劇情。
- 事件判定：`POST /api/events/input` 會在存在 active event 時立即判定成功/失敗，更新 `judge_result`、`hp`、`score`。
- 劇情生成：`StoryService` 會組裝 prompt 並呼叫 Ollama；若失敗則回退到內建 fallback 模板。
- 套件匯出：`routes`、`services`、`utils` 皆透過各自 `__init__.py` 對外提供統一匯入入口。

## 4. 開發指令

在 backend 目錄執行：

```bash
uv sync --dev
uv run app.py
```

執行測試：

```bash
uv run pytest -q
```

## 5. 環境變數

| 變數               | 說明                      | 預設值                       |
| ------------------ | ------------------------- | ---------------------------- |
| `APP_ENV`          | 執行環境                  | `development`                |
| `BACKEND_HOST`     | 後端 host                 | `0.0.0.0`                    |
| `BACKEND_PORT`     | 後端 port                 | `8000`                       |
| `API_BASE_URL`     | 對外 API 基底網址         | `http://localhost:8000`      |
| `EDGE_GATEWAY_URL` | Edge 事件來源（預留）     | `ws://localhost:9000/events` |
| `OLLAMA_BASE_URL`  | Ollama 服務 URL           | `http://localhost:11434`     |
| `OLLAMA_TIMEOUT_S` | Ollama 請求 timeout（秒） | `20`                         |
| `LLM_MODEL`        | 預設敘事模型              | `qwen3.5:latest`             |
| `LOG_LEVEL`        | 日誌等級                  | `INFO`                       |
| `CORS_ORIGINS`     | 允許前端來源（逗號分隔）  | `*`                          |

## 6. API 端點

### System

- `GET /api/health`
- `GET /api/config`

### Game

- `POST /api/game/start`
- `POST /api/game/reset`
- `GET /api/game/state`
- `POST /api/game/demo-event`

### Events

- `POST /api/events/input`
- `GET /api/events/current`
- `GET /api/events/history`

### Story

- `POST /api/story/generate`
- `GET /api/story/current`
