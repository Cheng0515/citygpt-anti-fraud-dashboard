# CityGPT 管理後臺 Demo

## Demo 目標

這份 Demo 聚焦 CityGPT 管理後臺，不包含原本的任務排程器入口。打開後會直接進入管理後臺，用於和 RD 對齊資訊架構、頁面範圍、互動行為與後續 API contract。

## 本版包含頁面

1. 使用者與權限
   - 使用者清單、角色切換、權限矩陣、停用確認。
2. 知識代理人管理
   - 代理人清單、System Prompt、Guardrails、可使用對象、授權群組、發布 / 停用。
3. 稽核日誌
   - 操作者、模組、動作、結果、Trace ID、異動前後。
4. 使用統計
   - 7 / 30 / 90 天 KPI、熱門知識庫、處室排行、錯誤摘要。
5. 回饋管理
   - 正負回饋、指派、標籤、狀態、處理說明。

## 如何執行

### 方式 A：直接開啟已打包畫面

解壓縮 ZIP 後，請先直接開最上層：

```text
index.html
```

本版打包已把 production build 放在最上層，方便 RD 直接雙擊 `index.html` 檢視 demo。

### 方式 B：開發模式

```bash
pnpm install
pnpm dev --port 5174
```

開啟：

```text
http://127.0.0.1:5174/
```

Production build：

```bash
pnpm build
```

測試：

```bash
pnpm test
```

## Demo 操作建議

1. 進入後臺首頁，確認左側「基本配置」側邊欄。
2. 切到「知識代理人管理」。
3. 新增「採購規範助手」。
4. 檢查右側 System Prompt、Guardrails、可使用對象。
5. 點「發布」，確認授權群組提示。
6. 切到「稽核日誌」，確認 Trace ID 與異動前後資料。
7. 切到「使用統計」，切換 7 / 30 / 90 天。
8. 切到「回饋管理」，將一筆回饋改成已完成。

## Mock 與 RD 對接假設

- 目前所有資料都是前端 mock，不連後端 API。
- 角色權限目前由 `src/admin/permissions.ts` 控制。
- Mock data 在 `src/admin/data.ts` 與 `src/admin/AdminApp.tsx`。
- 互動狀態存在 React local state，重新整理後會回到初始資料。
- 後續 API 建議拆成：
  - users / roles / permission groups
  - knowledge agents / prompt versions / release workflow
  - audit events
  - usage stats
  - feedback cases

## 驗證紀錄

- `pnpm build`
- `pnpm test`

## 待 RD 確認

- Prompt 版本是否需要審核流程：草稿 → 待審 → 已發布。
- 可使用對象是否以人員、處室、群組或 AD/SSO 群組為主。
- 稽核日誌要保留哪些欄位與保存期限。
- 使用統計的 KPI 定義是否要與驗收文件一致。
- 回饋是否會產生知識代理人的 Prompt 優化任務。
