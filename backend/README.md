# AI-Adventurer Backend

本目錄為 AI-Adventurer 後端 API 服務，負責系統狀態、遊戲狀態、事件輸入與劇情生成接口。

## 1. 技術棧

- Python 3.12+
- Flask 3
- flask-cors
- uv（套件管理與執行）
- pytest（測試）

## 2. 專案結構

```text
backend/
├── app.py                  # 目前後端入口
├── pyproject.toml
├── uv.lock
├── app/
│   ├── config.py           # 環境變數與設定
│   ├── models.py           # 資料模型
│   ├── routes/             # API 路由
│   ├── services/           # 業務邏輯
│   ├── middleware/         # 中間件
│   ├── utils/              # 共用工具
│   ├── domain/             # 領域邏輯（預留）
│   └── integrations/       # 外部整合（預留）
└── tests/
```

## 3. 架構說明

- 入口：`app.py` 建立 Flask app 並註冊所有 blueprint。
- 分層：`routes -> services -> models/store`，將 HTTP 與業務邏輯分離。
- 狀態：目前以 in-memory store 保存遊戲狀態與事件歷史。
- 回應格式：統一成功/失敗 envelope。
- CORS：使用 `CORS_ORIGINS` 控制可用來源（目前設計給前端開發環境）。

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

| 變數               | 說明                     | 預設值                       |
| ------------------ | ------------------------ | ---------------------------- |
| `APP_ENV`          | 執行環境                 | `development`                |
| `BACKEND_HOST`     | 後端 host                | `0.0.0.0`                    |
| `BACKEND_PORT`     | 後端 port                | `8000`                       |
| `API_BASE_URL`     | 對外 API 基底網址        | `http://localhost:8000`      |
| `EDGE_GATEWAY_URL` | Edge 事件來源（預留）    | `ws://localhost:9000/events` |
| `LLM_MODEL`        | 敘事模型名稱（預留）     | `gpt-4.1-mini`               |
| `LOG_LEVEL`        | 日誌等級                 | `INFO`                       |
| `CORS_ORIGINS`     | 允許前端來源（逗號分隔） | `*`                          |

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
