# CityGPT Anti-Fraud Dashboard

CityGPT 防詐 Dashboard 是一個前端展示型 prototype，用於智慧城市防詐情境展示。  
專案以 Vite + React + TypeScript + Tailwind CSS 建置，所有資料皆為模擬資料，不會連線到任何政府或警政系統。

## Features

- 防詐辨識力測驗
- 匿名通報與案件打包流程
- CityGPT 防詐戰情室
- 台灣區域風險熱區
- 案件派送、下架追蹤與圖表視覺化

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Demo Notice

本專案僅為概念展示：

- 不含真實個資
- 不實際通報任何政府、警政或平台單位
- 所有案件、數字、風險分級、下架狀態皆為模擬資料

## Project Structure

```text
src/
  components/demo/     Demo 專用 UI 與流程元件
  components/ui/       最小化共用 UI 元件
  data/                台灣地圖與區域資料
  pages/               App entry page
  test/                Vitest smoke tests
```
