# CityGPT 管理後臺 Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在現有 CityGPT Prototype 中新增五個可操作後臺模組，使用本地資料演示權限、知識管理、稽核、統計與回饋流程。

**Architecture:** 保留現有排程功能，將頂層應用改成產品入口切換，管理後臺使用獨立 `admin` 領域資料、狀態 reducer、共用殼層及五個頁面。所有修改操作只更新 React state；稽核頁永遠唯讀，角色權限由集中規則控制。

**Tech Stack:** React 19、TypeScript 6、Vite 7、Vitest、Testing Library、Lucide React、純 CSS。

---

## File Map

- `src/App.tsx`: 頂層產品入口，保留排程頁並加入管理後臺入口。
- `src/admin/types.ts`: 角色、使用者、文件、日誌、統計及回饋型別。
- `src/admin/data.ts`: 不含真實個資的寫實樣本資料。
- `src/admin/permissions.ts`: 角色可見頁面與操作權限純函式。
- `src/admin/AdminApp.tsx`: 管理後臺頁面路由、角色與本地 state。
- `src/admin/AdminShell.tsx`: 側欄、頂部角色切換、手機導覽與共通通知。
- `src/admin/components.tsx`: 表格框架、狀態標籤、抽屜與確認對話框。
- `src/admin/pages/UsersPage.tsx`: 使用者、角色、權限矩陣與停權。
- `src/admin/pages/KnowledgePage.tsx`: 文件生命週期與索引狀態。
- `src/admin/pages/AuditPage.tsx`: 唯讀日誌、篩選與詳情。
- `src/admin/pages/StatsPage.tsx`: KPI、時間範圍與指標說明。
- `src/admin/pages/FeedbackPage.tsx`: 回饋分類、指派與處理狀態。
- `src/admin/admin.css`: 管理後臺藍白視覺、響應式與無障礙樣式。
- `src/admin/*.test.ts(x)`: 權限與五模組主流程測試。

### Task 1: Admin domain and permissions

**Files:**
- Create: `src/admin/types.ts`
- Create: `src/admin/data.ts`
- Create: `src/admin/permissions.ts`
- Test: `src/admin/permissions.test.ts`

- [ ] **Step 1: Write failing permission tests**

```ts
import { describe, expect, it } from 'vitest'
import { allowedPages, can } from './permissions'

describe('admin permissions', () => {
  it('gives system admins every page and write action', () => {
    expect(allowedPages('system_admin')).toEqual(['users', 'knowledge', 'audit', 'stats', 'feedback'])
    expect(can('system_admin', 'users.manage')).toBe(true)
  })

  it('keeps auditors read-only and hides user management', () => {
    expect(allowedPages('auditor')).toEqual(['audit', 'stats'])
    expect(can('auditor', 'audit.view')).toBe(true)
    expect(can('auditor', 'knowledge.manage')).toBe(false)
  })
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/permissions.test.ts`

Expected: FAIL because `permissions.ts` does not exist.

- [ ] **Step 3: Implement typed domain and rules**

```ts
export type AdminRole = 'system_admin' | 'knowledge_admin' | 'auditor' | 'analyst'
export type AdminPage = 'users' | 'knowledge' | 'audit' | 'stats' | 'feedback'
export type Permission = 'users.manage' | 'knowledge.manage' | 'audit.view' | 'stats.view' | 'feedback.manage'

const pageRules: Record<AdminRole, AdminPage[]> = {
  system_admin: ['users', 'knowledge', 'audit', 'stats', 'feedback'],
  knowledge_admin: ['knowledge', 'stats', 'feedback'],
  auditor: ['audit', 'stats'],
  analyst: ['stats', 'feedback'],
}

export const allowedPages = (role: AdminRole) => pageRules[role]
export const can = (role: AdminRole, permission: Permission) => ({
  system_admin: ['users.manage', 'knowledge.manage', 'audit.view', 'stats.view', 'feedback.manage'],
  knowledge_admin: ['knowledge.manage', 'stats.view', 'feedback.manage'],
  auditor: ['audit.view', 'stats.view'],
  analyst: ['stats.view'],
}[role] as Permission[]).includes(permission)
```

Create typed sample arrays for users, documents, audit events, stats and feedback. Use fictional names and Yunlin/CityGPT organizational context only.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/permissions.test.ts`

Then run: `pnpm build`

Expected: permission tests and build PASS.

Commit: `feat: add admin domain and permissions`

### Task 2: Admin shell and product entry

**Files:**
- Create: `src/admin/AdminApp.tsx`
- Create: `src/admin/AdminShell.tsx`
- Create: `src/admin/components.tsx`
- Create: `src/admin/AdminShell.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing navigation tests**

```tsx
it('opens the CityGPT management center from the product entry', async () => {
  render(<App />)
  await userEvent.click(screen.getByRole('button', { name: '管理後臺' }))
  expect(screen.getByRole('heading', { name: '使用者與權限' })).toBeInTheDocument()
})

it('updates visible navigation when the role changes', async () => {
  render(<AdminApp onExit={() => {}} />)
  await userEvent.selectOptions(screen.getByLabelText('目前角色'), 'auditor')
  expect(screen.getByRole('button', { name: '稽核日誌' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '使用者與權限' })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/AdminShell.test.tsx`

Expected: FAIL because the admin shell and entry do not exist.

- [ ] **Step 3: Implement shell and page routing**

`App` stores `surface: 'scheduler' | 'admin'`. `AdminApp` stores `role`, `page`, shared sample state and a notice. `AdminShell` renders the five labels, filters them through `allowedPages(role)`, falls back to the first allowed page when role changes, and exposes a mobile menu button with an accessible name.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/AdminShell.test.tsx src/App.test.tsx`

Expected: navigation and existing scheduler tests PASS.

Commit: `feat: add CityGPT admin shell`

### Task 3: Users and permissions page

**Files:**
- Create: `src/admin/pages/UsersPage.tsx`
- Create: `src/admin/pages/UsersPage.test.tsx`
- Modify: `src/admin/AdminApp.tsx`

- [ ] **Step 1: Write failing user workflow tests**

```tsx
it('adds a user and shows the account in the filtered table', async () => {
  render(<AdminApp onExit={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: '新增使用者' }))
  await userEvent.type(screen.getByLabelText('姓名'), '測試管理員')
  await userEvent.type(screen.getByLabelText('Email'), 'admin@example.test')
  await userEvent.selectOptions(screen.getByLabelText('角色'), 'knowledge_admin')
  await userEvent.click(screen.getByRole('button', { name: '送出邀請' }))
  expect(screen.getByText('admin@example.test')).toBeInTheDocument()
})

it('requires explicit confirmation before suspending a user', async () => {
  render(<AdminApp onExit={() => {}} />)
  await userEvent.click(screen.getByRole('button', { name: /停權 王小明/ }))
  expect(screen.getByRole('dialog', { name: '確認停權使用者' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/pages/UsersPage.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement user list, drawer, role matrix and dialogs**

Render labelled search/unit/role/status filters, desktop table and mobile cards. The detail drawer shows effective permissions. Role editing updates local state. Suspension requires a named confirmation dialog. If `can(role, 'users.manage')` is false, disable write controls and render `目前角色沒有管理使用者的權限`.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/pages/UsersPage.test.tsx`

Expected: tests PASS.

Commit: `feat: add users and permissions prototype`

### Task 4: Knowledge lifecycle page

**Files:**
- Create: `src/admin/pages/KnowledgePage.tsx`
- Create: `src/admin/pages/KnowledgePage.test.tsx`
- Modify: `src/admin/AdminApp.tsx`

- [ ] **Step 1: Write failing knowledge tests**

```tsx
it('publishes a document after confirmation', async () => {
  render(<KnowledgePage role="system_admin" />)
  await userEvent.click(screen.getByRole('button', { name: /上架 農業政策手冊/ }))
  await userEvent.click(screen.getByRole('button', { name: '確認上架' }))
  expect(screen.getByText('已上架')).toBeInTheDocument()
})

it('retries an index failure and reaches completed', async () => {
  render(<KnowledgePage role="system_admin" />)
  await userEvent.click(screen.getByRole('button', { name: /重試索引 縣政 FAQ/ }))
  expect(await screen.findByText('已完成')).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/pages/KnowledgePage.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement upload, lifecycle, access and index interactions**

Upload uses file-name text input rather than transmitting a real file. Include knowledge/category/published/index/access filters, document detail/version drawer, publish/unpublish confirmations, editable category/access fields, and a short deterministic index progress sequence.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/pages/KnowledgePage.test.tsx`

Expected: tests PASS.

Commit: `feat: add knowledge lifecycle prototype`

### Task 5: Audit and statistics pages

**Files:**
- Create: `src/admin/pages/AuditPage.tsx`
- Create: `src/admin/pages/StatsPage.tsx`
- Create: `src/admin/pages/AuditStats.test.tsx`
- Modify: `src/admin/AdminApp.tsx`

- [ ] **Step 1: Write failing audit/statistics tests**

```tsx
it('keeps audit events read-only and shows before-after detail', async () => {
  render(<AuditPage />)
  await userEvent.click(screen.getAllByRole('button', { name: /查看事件/ })[0])
  expect(screen.getByText('變更前')).toBeInTheDocument()
  expect(screen.getByText('變更後')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /刪除日誌/ })).not.toBeInTheDocument()
})

it('changes KPI context when the range changes', async () => {
  render(<StatsPage />)
  await userEvent.click(screen.getByRole('button', { name: '近 30 天' }))
  expect(screen.getByText('近 30 天統計')).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/pages/AuditStats.test.tsx`

Expected: FAIL because the pages do not exist.

- [ ] **Step 3: Implement read-only audit and explainable KPI views**

Audit filters time/module/action/result and displays event drawer with trace ID, IP, permission result, before and after. Export only shows a Prototype success notice. Stats uses native `<progress>` elements, KPI buttons, top knowledge bases, department ranking and unanswered/error summaries; selecting a KPI updates its definition panel.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/pages/AuditStats.test.tsx`

Expected: tests PASS.

Commit: `feat: add audit and statistics prototype`

### Task 6: Feedback management page

**Files:**
- Create: `src/admin/pages/FeedbackPage.tsx`
- Create: `src/admin/pages/FeedbackPage.test.tsx`
- Modify: `src/admin/AdminApp.tsx`

- [ ] **Step 1: Write failing feedback tests**

```tsx
it('assigns, tags and completes feedback with a required note', async () => {
  render(<FeedbackPage role="system_admin" />)
  await userEvent.click(screen.getAllByRole('button', { name: /查看回饋/ })[0])
  await userEvent.selectOptions(screen.getByLabelText('指派處理人'), 'knowledge-team')
  await userEvent.type(screen.getByLabelText('新增標籤'), '索引品質')
  await userEvent.click(screen.getByRole('button', { name: '新增標籤' }))
  await userEvent.selectOptions(screen.getByLabelText('處理狀態'), 'completed')
  await userEvent.type(screen.getByLabelText('處理註記'), '已重建索引並確認引用來源。')
  await userEvent.click(screen.getByRole('button', { name: '儲存處理結果' }))
  expect(screen.getByText('已完成')).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin/pages/FeedbackPage.test.tsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement feedback queue and detail processing**

Include positive-rate KPI, pending count, sentiment/status/knowledge/tag filters, detail drawer with question/answer/citations/context, assignee, tags, status and required completion note. Save updates local rows and KPI values.

- [ ] **Step 4: Verify GREEN and commit**

Run: `pnpm test -- src/admin/pages/FeedbackPage.test.tsx`

Expected: tests PASS.

Commit: `feat: add feedback management prototype`

### Task 7: Visual system, responsive QA and handoff

**Files:**
- Create: `src/admin/admin.css`
- Modify: `src/admin/AdminShell.tsx`
- Modify: `src/admin/components.tsx`
- Modify: `src/styles.css`
- Create: `README.md`

- [ ] **Step 1: Add accessibility assertions**

```tsx
it('exposes labelled navigation and role controls', () => {
  render(<AdminApp onExit={() => {}} />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByLabelText('目前角色')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '開啟管理選單' })).toBeInTheDocument()
})

it('explains disabled actions for a read-only role', async () => {
  render(<UsersPage role="auditor" />)
  expect(screen.getByText('目前角色沒有管理使用者的權限')).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify RED**

Run: `pnpm test -- src/admin`

Expected: missing semantics produce focused failures.

- [ ] **Step 3: Implement CityGPT responsive styling**

Use existing blue tokens, white cards, 16–18px radii, subtle blue shadows, 44px controls and clear focus rings. At 960px collapse the sidebar; at 720px replace tables with cards and stack filters. Status always includes text and Lucide icon.

- [ ] **Step 4: Run complete verification**

Run: `pnpm test`

Then run: `pnpm build`

Expected: all tests PASS; build exits 0.

- [ ] **Step 5: Browser verification**

Run: `pnpm dev -- --port 5174`

Verify each page, role switching, one write workflow per mutable module, audit read-only behavior, stats range, feedback completion, desktop 1280×720 and mobile 390×844.

- [ ] **Step 6: Commit**

Commit: `feat: finish CityGPT admin console prototype`
