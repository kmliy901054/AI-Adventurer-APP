# AI-Adventurer Frontend

本目錄為 AI-Adventurer 前端應用，負責遊戲畫面呈現、互動流程控制與後端 API 串接。

## 1. 技術棧

- React 19
- TypeScript
- Vite 8
- React Router
- TanStack Query
- Tailwind CSS 4
- shadcn/ui + Radix UI

## 2. 專案結構

```text
frontend/
├── src/
│   ├── api/                # 各端點 API 函式（get/post 分檔）
│   ├── components/
│   │   ├── common/         # 共用元件（設定面板、返回按鈕）
│   │   ├── layout/         # 版面元件（RootLayout）
│   │   ├── ui/             # shadcn/radix UI 元件
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── queries/        # 查詢 hooks
│   │   ├── mutations/      # 變更 hooks
│   │   ├── useQuery.ts     # Query 共用封裝
│   │   └── useMutation.ts  # Mutation 共用封裝
│   ├── lib/
│   │   ├── apiClient.ts    # 統一 API client
│   │   └── queryClient.ts  # TanStack Query client
│   ├── pages/
│   │   ├── Home/
│   │   ├── Game/
│   │   ├── Calibration/
│   │   └── HowToPlay/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

## 3. 架構說明

- 路由入口在 `src/App.tsx`，由 `RootLayout` 統一承接設定面板與頁面 context。
- API 層採用「每端點一檔」策略，集中於 `src/api/`。
- React Query 使用 `hooks/queries` 與 `hooks/mutations` 分離管理。
- 全域 API 行為（base URL、錯誤處理、序列化）統一在 `src/lib/apiClient.ts`。
- Theme 與 Debug 模式由共用元件控制，避免頁面重複邏輯。

目前頁面路由：

- `/`、`/home`：首頁
- `/game`：遊戲主畫面
- `/calibration`：姿態校正（TODO）
- `/how-to-play`：玩法說明（TODO）

## 4. 開發指令

在 frontend 目錄執行：

```bash
npm install
npm run dev
```

其他常用指令：

```bash
npm run build
npm run preview
npm run lint
```

## 5. 環境變數

| 變數                | 說明              | 預設值                  |
| ------------------- | ----------------- | ----------------------- |
| `VITE_API_BASE_URL` | 後端 API 基底網址 | `http://localhost:8000` |

建議建立 `.env.local`：

```env
VITE_API_BASE_URL=http://localhost:8000
```
