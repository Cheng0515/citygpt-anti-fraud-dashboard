# AI知識代理人管理後臺 Demo

## Demo 目標

這份 Demo 聚焦 AI知識代理人管理後臺，不包含原本的任務排程器入口。打開後會直接進入管理後臺，用於和 RD 對齊資訊架構、頁面範圍、互動行為與後續 API contract。

## 本版包含頁面

1. 使用者與權限
   - SSO 使用者清單、SSO 狀態唯讀顯示、操作欄一般USER / 管理者切換。
2. 使用統計
   - 日 / 週 / 月 KPI、AI 使用量（Token）、只列超過 300,000 Token 的個人月用量異常、部門與角色用量、常被引用文件、找不到答案與低相關度問題。
3. 稽核日誌
   - 正常操作不記錄，只保留 SSO / 准入錯誤、管理操作錯誤、CityGPT 匯出錯誤、安全與 Token 異常；提供操作者、時間、操作類型、原因、Trace ID 與資料快照，並標示至少保留 180 天。
4. 回饋管理
   - 填寫回饋、1-10 分回饋評分、文字意見 200 字上限、正向回饋率目標 70%、指派、標籤、狀態、處理說明。

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
4. 切到「使用統計」，切換日 / 週 / 月，確認個人清單只列超過 300,000 Token 的異常者，以及部門/角色彙整、引用文件與問題清單。
5. 切到「稽核日誌」，確認只顯示錯誤 / 異常事件，再查看人員 / 時間 / 操作類型篩選、事件原因、Trace ID、資料快照與 Token 用量異常通知。
6. 切到「回饋管理」，調整 1-10 分評分並將一筆回饋改成已完成。

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
  - feedback cases

## 流量統計與稽核切分

- 每個使用者都要記錄流量統計：月 token、提問次數、平均每日提問、最後使用時間。
- 一般使用不逐筆寫入稽核日誌，避免 1,000 位使用者的日常紀錄淹沒資安事件。
- 建議保留短期 request 明細供排查，但不存完整 prompt；只保留 traceId、token、模型、狀態、時間與必要分類。
- 後臺個人清單只顯示超過 300,000 tokens / 月的異常者，不顯示正常或接近門檻者。
- 超過 300,000 tokens / 月才建立「Token 用量異常」稽核事件，並通知 IT 與 admin。

## 稽核範圍與責任邊界

- 正常操作不寫入稽核日誌，只保留錯誤、阻擋、系統失敗與 Token 超標事件。
- CityGPT 只記錄 SSO 回傳的拒絕、停用、串接驗證錯誤與後臺准入阻擋；正常登入不進稽核日誌。
- 密碼輸錯、可疑 IP / 地點及暴力登入由 SSO / AD 稽核，CityGPT 不重複判斷。
- SharePoint 等來源系統的實際文件下載、權限阻擋與大量下載，以來源系統日誌為準。
- CityGPT 只記自己的稽核日誌匯出錯誤；若未來由 CityGPT 代理檔案下載，再加上權限拒絕與大量下載異常。
- 一般 AI 提問只做用量與品質統計；敏感、異常或失敗查詢才進入稽核日誌，且不保存完整 Prompt。

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

- 稽核日誌是否固定保留 180 天，以及各類錯誤事件的後端來源。
- Token 用量異常的月門檻是否固定 300,000 tokens，或依部門 / 職務調整。
- 使用統計的日 / 週 / 月定義是否與驗收文件一致。
- 回饋評分 1-10 分是否要和正向 / 負向門檻固定為 7 分。
