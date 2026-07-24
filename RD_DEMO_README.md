# CityGPT 管理後臺 Demo

## Demo 目標

這份 Demo 聚焦 CityGPT 管理後臺，不包含原本的任務排程器入口。打開後會直接進入管理後臺，用於和 RD 對齊資訊架構、頁面範圍、互動行為與後續 API contract。

## 本版包含頁面

1. 使用者與權限
   - 使用者清單、操作欄一般USER / 管理者切換、停用確認。
2. 稽核日誌
   - 操作者、模組、動作、結果、Trace ID、異動前後、Token 用量異常通知。
3. 使用統計
   - 7 / 30 / 90 天 KPI、每人月流量統計、熱門知識庫、負向回饋與未解決。
4. 回饋管理
   - 填寫回饋、1-10 分回饋評分、指派、標籤、狀態、處理說明。

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
2. 在使用者清單操作欄切換一般USER / 管理者。
3. 停用一筆使用者，確認停用流程。
4. 切到「稽核日誌」，確認 Trace ID、異動前後資料、敏感/異常事件與 Token 用量異常通知。
5. 切到「使用統計」，切換 7 / 30 / 90 天，確認「每人流量統計」與「異常才進稽核」規則。
6. 切到「回饋管理」，調整 1-10 分評分並將一筆回饋改成已完成。

## Mock 與 RD 對接假設

- 目前所有資料都是前端 mock，不連後端 API。
- 角色目前只有 `user`（一般USER）與 `admin`（管理者）。
- 後臺准入目前由 `src/admin/permissions.ts` 控制，只有 `admin`（管理者）能進入後臺。
- Mock data 在 `src/admin/data.ts` 與 `src/admin/AdminApp.tsx`。
- 互動狀態存在 React local state，重新整理後會回到初始資料。
- 後續 API 建議拆成：
  - backend admin users / admin access gate
  - audit events
  - per-user traffic stats
  - token usage monthly aggregation / anomaly notification
  - usage stats
  - feedback cases

## 流量統計與稽核切分

- 每個使用者都要記錄流量統計：月 token、提問次數、平均每日提問、最後使用時間。
- 一般使用不逐筆寫入稽核日誌，避免 1,000 位使用者的日常紀錄淹沒資安事件。
- 建議保留短期 request 明細供排查，但不存完整 prompt；只保留 traceId、token、模型、狀態、時間與必要分類。
- 超過 80% 月門檻先列入觀察名單，不寄信、不寫稽核。
- 超過 300,000 tokens / 月才建立「Token 用量異常」稽核事件，並通知 IT 與 admin。

## Token 用量異常規則

- 日常短問答 / 潤飾：約 800 tokens，約 28 次 / 天。
- 公文 / 報告摘要：約 2,200 tokens，約 10 次 / 天。
- 長文件 / 法規研析：約 5,000 tokens，約 4-5 次 / 天。
- 一般同仁日常混用建議抓 12-18 次 / 天，月用量門檻暫定 300,000 tokens。
- 單一使用者本月 token 用量超過門檻時，建立稽核事件並自動發信給 IT 與 admin。

## 驗證紀錄

- `pnpm build`
- `pnpm test`

## 待 RD 確認

- 一般USER 是否需要批次匯入與大量搜尋。
- 稽核日誌要保留哪些欄位與保存期限。
- Token 用量異常的月門檻是否固定 300,000 tokens，或依部門 / 職務調整。
- 使用統計的 KPI 定義是否要與驗收文件一致。
- 回饋評分 1-10 分是否要和正向 / 負向門檻固定為 7 分。
