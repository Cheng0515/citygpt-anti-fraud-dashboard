# CityGPT 管理後臺 Demo

## Demo 目標

這份 Demo 聚焦 CityGPT 管理後臺，不包含原本的任務排程器入口。打開後會直接進入管理後臺，用於和 RD 對齊資訊架構、頁面範圍、互動行為與後續 API contract。

## 本版包含頁面

1. 使用者與權限
   - SSO 使用者清單、SSO 狀態唯讀顯示、操作欄一般USER / 管理者切換。
2. 使用統計
   - 日 / 週 / 月 KPI、AI 使用量（Token）、功能使用頻率、部門與角色用量、常被引用文件、找不到答案與低相關度問題。
3. 稽核日誌
   - 操作者、時間、操作類型、模組、動作、結果、Trace ID、異動前後、Token 用量異常通知；標示至少保留 180 天。
4. 回饋管理
   - 填寫回饋、1-10 分回饋評分、文字意見 200 字上限、正向回饋率目標 70%、指派、標籤、狀態、處理說明。
5. 系統狀態
   - 文件同步、讀取、建立 AI 可搜尋資料狀態；失敗原因；重新執行。RAG 文件來源、權限與上架狀態只作為輔助資訊唯讀顯示。

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
2. 在使用者清單確認 SSO 有效 / SSO 停用 / 同步異常狀態只讀顯示。
3. 在操作欄切換一般USER / 管理者，確認 CityGPT 後臺只控制角色，不控制 SSO 停用。
4. 切到「使用統計」，切換日 / 週 / 月，確認 Token、功能頻率、部門/角色彙整、引用文件與問題清單。
5. 切到「稽核日誌」，確認人員 / 時間 / 操作類型篩選、Trace ID、異動前後資料、敏感/異常事件與 Token 用量異常通知。
6. 切到「回饋管理」，調整 1-10 分評分並將一筆回饋改成已完成。
7. 切到「系統狀態」，確認文件同步、讀取與建立搜尋資料狀態；失敗文件可按重新執行。

## Mock 與 RD 對接假設

- 目前所有資料都是前端 mock，不連後端 API。
- 角色目前只有 `user`（一般USER）與 `admin`（管理者）。
- 帳號有效 / 停用由 SSO / AD 控制；CityGPT 後臺只接收並顯示 SSO 同步狀態。
- 後臺准入目前由 `src/admin/permissions.ts` 控制，只有 `admin`（管理者）能進入後臺。
- Mock data 在 `src/admin/data.ts` 與 `src/admin/AdminApp.tsx`。
- 互動狀態存在 React local state，重新整理後會回到初始資料。
- 後續 API 建議拆成：
  - backend admin users / admin access gate
  - SSO user sync status
  - audit events
  - per-user traffic stats
  - token usage monthly aggregation / anomaly notification
  - usage stats
  - document sync / read / searchable index status
  - feedback cases

## PRD 對齊取捨

- 不做獨立重型「RAG 文件查閱」頁，避免投入過多 RD 成本在低頻唯讀查閱。
- RAG 文件來源、存取權限、上架狀態保留在「系統狀態」頁作為輔助資訊。
- 本期重點放在縣府管理者更常驗收的同步是否成功、AI 是否可搜尋、失敗原因與重新執行。
- 文件實際權限、上架 / 下架仍建議由既有文件系統或 RAG 管理流程維護。

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
- 稽核日誌是否固定保留 180 天，以及操作類型是否包含登入 / 查詢 / 下載 / 管理操作 / 系統判斷。
- Token 用量異常的月門檻是否固定 300,000 tokens，或依部門 / 職務調整。
- 使用統計的日 / 週 / 月定義是否與驗收文件一致。
- 回饋評分 1-10 分是否要和正向 / 負向門檻固定為 7 分。
- 系統狀態中的重新執行是否只限失敗 / 等待重試文件。
