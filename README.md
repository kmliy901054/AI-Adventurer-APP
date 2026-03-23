# AI-Adventurer 全端系統

本文件負責**說明**這個全端子系統是什麼、解決什麼問題、包含哪些能力，以及如何快速啟動。

## 1. 專案概述

AI-Adventurer 全端系統負責承接來自感測端 / Edge AI 端的動作事件，並在 PC 端完成：

- 遊戲狀態管理
- 劇情 / 敘事生成
- 事件判定與回饋
- 前端互動介面顯示
- 日誌與除錯資訊輸出

## 2. 系統功能

### 核心功能

- **Game Manager**：管理章節、事件、玩家狀態與回合流程
- **Event Judge**：依據目標動作、時間限制與辨識結果判定成功 / 失敗
- **Story Service**：根據章節背景、關鍵詞與事件結果生成敘事文字
- **Frontend UI**：顯示遊戲畫面、玩家狀態、目標動作、倒數計時與敘事內容
- **Gateway / API**：與 Edge AI 端或其他服務交換資料
- **Logger**：記錄事件流、判定結果與錯誤資訊

### 展示目標

- 即時顯示當前劇情與狀態
- 即時回應玩家動作結果
- 在失敗 / 成功後呈現對應敘事回饋
- 支援現場 demo 的穩定啟動流程

## 3. 使用情境

### 主要流程

1. 玩家開始遊戲
2. 前端顯示章節背景與劇情
3. 後端從事件池抽取事件
4. Edge AI 端回傳動作分數 / 穩定動作
5. Event Judge 判定是否在時限內完成指定動作
6. Game Manager 更新生命值 / 分數 / 關卡狀態
7. Story Service 生成成功或失敗敘事
8. 前端顯示新的狀態與文字

### 典型使用者

- 玩家
- 展示人員 / 評審
- 開發者 / 維護者

## 4. 技術棧

### 前端

- **Framework**: React 19.2.0
- **Language**: TypeScript
- **UI**: Radix UI + Tailwind CSS + Shadcn
- **State Management**: React Hooks
- **Build Tool**: Vite 7.3.1

### 後端

- **Framework**: Flask 3.x
- **Language**: Python
- **Package Manager**: uv

## 5. 專案結構

```text
AI-Adventurer/
├── frontend/                 # 前端應用
│   ├── src/
│   │   ├── api/              # API 函式
│   │   ├── pages/            # 頁面級模組
│   │   ├── components/       # 共用元件
│   │   ├── hooks/            # 共用 hooks
│   │   │   ├── queries/         # 查詢 hooks
│   │   │   ├── mutations/       # 變更 hooks
│   │   │   ├── useQuery.ts      # Query 共通封裝
│   │   │   └── useMutation.ts   # Mutation 共通封裝
│   │   ├── lib/              # API / utils
│   │   ├── types/            # 全域型別
│   │   └── main.tsx
│   └── public/
├── backend/                  # 後端應用
│   ├── app/                  # 應用主體
│   │   ├── routes/           # HTTP / WS 路由
│   │   ├── services/         # 業務邏輯
│   │   ├── domain/           # 遊戲規則 / 領域模型
│   │   ├── integrations/     # LLM / Edge AI / 外部服務
│   │   ├── middleware/       # 中間件
│   │   └── utils/            # 工具函式
│   ├── tests/
│   └── main.py
├── README.md                 # 說明文件
├── spec.md                   # 約束文件
├── architecture.md           # 實作文件
├── docker-compose.yml
└── .env.example
```

## 6. 快速開始

### 使用 Docker Compose

```bash
cp .env.example .env

docker compose up --build
```

### 本機開發

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
uv sync --dev
uv run app.py
```

## 7. 環境變數

| 變數               | 說明                     | 預設值                                        |
| ------------------ | ------------------------ | --------------------------------------------- |
| `APP_ENV`          | 執行環境                 | `development`                                 |
| `BACKEND_HOST`     | 後端 host                | `0.0.0.0`                                     |
| `BACKEND_PORT`     | 後端 port                | `8000`                                        |
| `API_BASE_URL`     | 對外 API 基底網址        | `http://localhost:8000`                       |
| `EDGE_GATEWAY_URL` | Edge 事件來源（預留）    | `ws://localhost:9000/events`                  |
| `LLM_MODEL`        | 敘事模型名稱（預留）     | `gpt-4.1-mini`                                |
| `LOG_LEVEL`        | 日誌等級                 | `INFO`                                        |
| `CORS_ORIGINS`     | 允許前端來源（逗號分隔） | `http://localhost:5173,http://127.0.0.1:5173` |

## 8. 文件導覽

- **README.md**：看整體說明、功能、快速開始、操作方式
- **spec.md**：看需求邊界、資料契約、限制條件、驗收標準
- **architecture.md**：看模組切分、資料流、資料夾結構、部署方式、實作策略
