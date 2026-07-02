# AI 任務排程助理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個完整可操作的 CityGPT 風格排程原型，讓使用者描述任務後由系統自動建立並串接搜尋、AI 整理與 Email 步驟。

**Architecture:** 使用 React 單頁應用與本地 state machine 模擬 AI 解析、流程測試、執行紀錄及草稿復原。領域推斷與驗證維持純函式，畫面拆成任務列表、任務建立器、工作流卡片、排程摘要、Email 預覽及測試時間軸，所有工程變數只在進階設定顯示。

**Tech Stack:** React 19、TypeScript 6、Vite 7、Vitest、Testing Library、Lucide React、純 CSS。

---

## File Map

- `package.json`: 指令與依賴。
- `vite.config.ts`, `tsconfig.json`, `index.html`: Vite 與 TypeScript 基礎設定。
- `src/main.tsx`: 應用入口。
- `src/App.tsx`: 列表／建立器頁面切換與頂層任務狀態。
- `src/domain/scheduler.ts`: 任務、步驟、狀態與測試紀錄型別。
- `src/domain/inferTask.ts`: 從自然語言產生任務意圖與三步流程。
- `src/domain/validation.ts`: 儲存前驗證與可讀錯誤。
- `src/hooks/useDraft.ts`: localStorage 草稿、自動儲存及還原。
- `src/components/TaskList.tsx`: 搜尋、篩選、排序、狀態切換、執行紀錄與安全刪除。
- `src/components/TaskBuilder.tsx`: 四階段建立流程與全域狀態協調。
- `src/components/IntentSummary.tsx`: AI 推測與使用者描述的可編輯意圖摘要。
- `src/components/WorkflowStepCard.tsx`: 白話步驟卡、自動串接、進階資料來源及規則優化。
- `src/components/SchedulePanel.tsx`: 缺漏摘要、排程設定與固定操作區。
- `src/components/EmailPreview.tsx`: 桌面／手機預覽與 Email 模板。
- `src/components/TestRunPanel.tsx`: 測試執行時間軸、失敗與重試。
- `src/styles.css`: CityGPT 藍白 tokens、響應式、焦點、狀態與版面。
- `src/**/*.test.ts(x)`: 領域與互動測試。

### Task 1: Scaffold the tested Vite application

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Add package and compiler configuration**

```json
{
  "name": "citygpt-ai-scheduler-assistant",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "latest",
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vite": "latest",
    "vitest": "latest"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals"]
  },
  "include": ["src", "vite.config.ts"]
}
```

```html
<!-- index.html -->
<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#236cf2" />
    <title>AI 任務排程</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' },
});
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`

Expected: exit code 0 and a generated `pnpm-lock.yaml`.

- [ ] **Step 3: Write the failing application smoke test**

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the AI scheduler landing surface', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'AI 任務排程' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '建立新任務' })).toBeInTheDocument();
  });
});
```

Run: `pnpm test -- src/App.test.tsx`

Expected: FAIL because `App` does not exist.

- [ ] **Step 4: Add the minimal entry and shell**

```tsx
// src/App.tsx
export default function App() {
  return (
    <main>
      <h1>AI 任務排程</h1>
      <button type="button">建立新任務</button>
    </main>
  );
}
```

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
```

Run: `pnpm test -- src/App.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vite.config.ts index.html src
git commit -m "chore: scaffold scheduler prototype"
```

### Task 2: Model task inference and validation

**Files:**
- Create: `src/domain/scheduler.ts`
- Create: `src/domain/inferTask.ts`
- Create: `src/domain/inferTask.test.ts`
- Create: `src/domain/validation.ts`
- Create: `src/domain/validation.test.ts`

- [ ] **Step 1: Define the scheduler contracts**

```ts
// src/domain/scheduler.ts
export type TaskStatus = 'active' | 'paused' | 'error' | 'completed' | 'draft';
export type IntentField = { label: string; value: string; source: 'user' | 'ai' };
export type WorkflowStep = {
  id: 'step_1' | 'step_2' | 'step_3';
  kind: 'search' | 'ai' | 'email';
  title: string;
  inputFrom?: string[];
  inputLabel?: string;
  outputKey?: string;
  outputLabel?: string;
  fields: Record<string, string>;
};
export type Schedule = { frequency: 'once' | 'daily' | 'weekly'; date: string; time: string; enabled: boolean; inferredTime: boolean };
export type SchedulerTask = { id: string; title: string; description: string; intent: IntentField[]; steps: WorkflowStep[]; schedule: Schedule; status: TaskStatus; updatedAt: string };
export type TestRunItem = { id: WorkflowStep['id']; label: string; state: 'idle' | 'running' | 'success' | 'error'; summary: string };
```

- [ ] **Step 2: Write failing inference and validation tests**

```ts
// src/domain/inferTask.test.ts
import { describe, expect, it } from 'vitest';
import { inferTask } from './inferTask';

describe('inferTask', () => {
  it('creates a human-readable three-step Yunlin news workflow', () => {
    const task = inferTask('搜尋雲林相關新聞明天發送');
    expect(task.steps.map(step => step.title)).toEqual(['搜尋資料', 'AI 整理內容', '寄送 Email']);
    expect(task.steps[1].inputLabel).toBe('Step 1 搜尋結果');
    expect(task.steps[2].fields.bodySource).toBe('AI 摘要結果');
    expect(task.schedule.time).toBe('08:30');
  });
});
```

```ts
// src/domain/validation.test.ts
import { describe, expect, it } from 'vitest';
import { inferTask } from './inferTask';
import { validateTask } from './validation';

it('requires an email recipient before save', () => {
  expect(validateTask(inferTask('搜尋雲林新聞明天發送'))).toEqual([
    { field: 'recipient', message: '請先填寫收件人，才能建立寄送 Email 任務。' },
  ]);
});
```

Run: `pnpm test -- src/domain`

Expected: FAIL because the inference and validation functions do not exist.

- [ ] **Step 3: Implement deterministic local inference**

```ts
// src/domain/inferTask.ts
import type { SchedulerTask } from './scheduler';

export function inferTask(description: string): SchedulerTask {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = tomorrow.toISOString().slice(0, 10);
  return {
    id: 'draft-task',
    title: '搜尋雲林相關新聞並寄出摘要',
    description,
    intent: [
      { label: '主題', value: '雲林最新新聞', source: 'user' },
      { label: '閱讀對象', value: '主管', source: 'ai' },
      { label: '輸出格式', value: '正式重點摘要', source: 'ai' },
      { label: '寄送方式', value: 'Email', source: 'user' },
    ],
    steps: [
      { id: 'step_1', kind: 'search', title: '搜尋資料', outputKey: 'step_1_output', outputLabel: '搜尋結果', fields: { query: '雲林最新新聞、雲林縣政府、雲林地方新聞', scope: '最新網路新聞與官方網站' } },
      { id: 'step_2', kind: 'ai', title: 'AI 整理內容', inputFrom: ['step_1_output'], inputLabel: 'Step 1 搜尋結果', outputKey: 'step_2_output', outputLabel: 'AI 摘要結果', fields: { rules: '整理新聞標題、來源、重點摘要、影響層面與建議追蹤事項；資料不足時明確標示，不自行推測。' } },
      { id: 'step_3', kind: 'email', title: '寄送 Email', inputFrom: ['step_2_output'], inputLabel: 'Step 2 AI 摘要結果', fields: { recipient: '', subject: '每日雲林新聞摘要', bodySource: 'AI 摘要結果', intro: '請參考以下今日雲林新聞摘要。', outro: '以上提供參考，謝謝。' } },
    ],
    schedule: { frequency: 'once', date, time: '08:30', enabled: true, inferredTime: true },
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };
}
```

```ts
// src/domain/validation.ts
import type { SchedulerTask } from './scheduler';

export type ValidationIssue = { field: 'recipient' | 'date' | 'time' | 'source'; message: string };
export function validateTask(task: SchedulerTask): ValidationIssue[] {
  const email = task.steps.find(step => step.kind === 'email');
  if (!email?.fields.recipient.trim()) return [{ field: 'recipient', message: '請先填寫收件人，才能建立寄送 Email 任務。' }];
  if (!task.schedule.date) return [{ field: 'date', message: '請先設定執行日期。' }];
  if (!task.schedule.time) return [{ field: 'time', message: '請先設定執行時間。' }];
  if (task.steps.slice(1).some(step => !step.inputFrom?.length)) return [{ field: 'source', message: '工作流程仍有步驟缺少資料來源。' }];
  return [];
}
```

Run: `pnpm test -- src/domain`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/domain
git commit -m "feat: add scheduler inference and validation"
```

### Task 3: Build the task list and full-page builder shell

**Files:**
- Create: `src/data/sampleTasks.ts`
- Create: `src/components/TaskList.tsx`
- Create: `src/components/TaskList.test.tsx`
- Create: `src/components/TaskBuilder.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing navigation and list tests**

```tsx
// src/components/TaskList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { TaskList } from './TaskList';

it('filters tasks and starts the builder', async () => {
  const onCreate = vi.fn();
  render(<TaskList tasks={[]} onCreate={onCreate} onUpdate={() => {}} onDelete={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: '建立新任務' }));
  expect(onCreate).toHaveBeenCalledOnce();
});
```

```tsx
// add to src/App.test.tsx
import userEvent from '@testing-library/user-event';

it('opens the full-page task builder', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: '建立新任務' }));
  expect(screen.getByRole('heading', { name: '建立 AI 排程任務' })).toBeInTheDocument();
});
```

Run: `pnpm test -- src/App.test.tsx src/components/TaskList.test.tsx`

Expected: FAIL because the components and navigation do not exist.

- [ ] **Step 2: Implement list state and builder navigation**

`TaskList` must render a labelled search input, status filter, sort select, five-column desktop task list, readable status labels, and named row actions. `App` owns `tasks` and `view`, with `view` switching between `'list'` and `'builder'`. The create button sets `view` to `'builder'`; builder cancel sets it back to `'list'` without mutation.

```ts
// src/data/sampleTasks.ts
import type { SchedulerTask } from '../domain/scheduler';
import { inferTask } from '../domain/inferTask';

const active = inferTask('每天搜尋雲林新聞並寄出 Email');
active.id = 'yunlin-daily';
active.title = '每日雲林新聞摘要';
active.status = 'active';
active.steps[2].fields.recipient = '主管信箱';

const paused = inferTask('每週整理縣府公告');
paused.id = 'weekly-notice';
paused.title = '每週縣府公告整理';
paused.status = 'paused';
paused.schedule.frequency = 'weekly';

export const sampleTasks: SchedulerTask[] = [active, paused];
```

```tsx
// src/App.tsx core state
const [view, setView] = useState<'list' | 'builder'>('list');
const [tasks, setTasks] = useState<SchedulerTask[]>(sampleTasks);
return view === 'list'
  ? <TaskList tasks={tasks} onCreate={() => setView('builder')} onUpdate={updateTask} onDelete={deleteTask} />
  : <TaskBuilder onCancel={() => setView('list')} onSave={task => { setTasks(current => [task, ...current]); setView('list'); }} />;
```

```tsx
// src/components/TaskBuilder.tsx initial contract
export function TaskBuilder({ onCancel, onSave }: { onCancel: () => void; onSave: (task: SchedulerTask) => void }) {
  return <main className="builder-page"><button onClick={onCancel}>返回任務列表</button><h1>建立 AI 排程任務</h1></main>;
}
```

Run: `pnpm test -- src/App.test.tsx src/components/TaskList.test.tsx`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx src/components
git commit -m "feat: add scheduler list and builder navigation"
```

### Task 4: Implement AI intent confirmation and workflow cards

**Files:**
- Create: `src/components/IntentSummary.tsx`
- Create: `src/components/WorkflowStepCard.tsx`
- Create: `src/components/WorkflowStepCard.test.tsx`
- Modify: `src/components/TaskBuilder.tsx`

- [ ] **Step 1: Write the failing AI-first workflow test**

```tsx
// src/components/WorkflowStepCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { TaskBuilder } from './TaskBuilder';

it('generates and automatically connects three human-readable steps', async () => {
  render(<TaskBuilder onCancel={() => {}} onSave={() => {}} />);
  await userEvent.type(screen.getByLabelText('描述你想自動完成的任務'), '搜尋雲林相關新聞明天發送');
  await userEvent.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }));
  expect(await screen.findByText('已為你建立 3 個步驟')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: '搜尋資料' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'AI 整理內容' })).toBeInTheDocument();
  expect(screen.getByText('自動使用：Step 1 搜尋結果')).toBeInTheDocument();
  expect(screen.queryByText('{{step_1_output}}')).not.toBeInTheDocument();
});
```

Run: `pnpm test -- src/components/WorkflowStepCard.test.tsx`

Expected: FAIL because generation and workflow cards do not exist.

- [ ] **Step 2: Implement generation, intent editing, and progressive disclosure**

`TaskBuilder` stores `description`, `task`, `stage`, `expandedStep`, and `history`. Clicking generation sets `stage` to `'generating'`, then uses `inferTask(description)` and displays a four-item progress header. `IntentSummary` renders editable inputs with visible badges `AI 建議` or `依照你的描述`.

`WorkflowStepCard` receives `{ step, expanded, onToggle, onChange, onOptimize, onUndo }`. The collapsed view shows title, completion summary, output label, and a Lucide status icon. The expanded view shows fields and a source chip. The advanced disclosure exposes `outputKey` and `inputFrom`; these strings never render outside that disclosure.

```tsx
// optimization interaction inside WorkflowStepCard
{showSuggestion && (
  <section aria-label="AI 整理規則建議" className="suggestion-card">
    <p><strong>原本：</strong>{step.fields.rules}</p>
    <p><strong>建議：</strong>{optimizedRules}</p>
    <button onClick={() => onOptimize(optimizedRules)}>套用建議</button>
    <button onClick={() => setShowSuggestion(false)}>保留原本</button>
  </section>
)}
```

Run: `pnpm test -- src/components/WorkflowStepCard.test.tsx`

Expected: PASS.

- [ ] **Step 3: Add automatic source and multi-input behavior**

In advanced settings, render checkboxes for all prior outputs. Changing sources updates `inputFrom` and `inputLabel`; prevent selecting a later step. Add a confirmation message naming affected steps before applying a changed source, and push the previous task into `history` so `復原上一步變更` restores it.

Run: `pnpm test -- src/components/WorkflowStepCard.test.tsx`

Expected: PASS with added cases for source changes and undo.

- [ ] **Step 4: Commit**

```bash
git add src/components src/domain
git commit -m "feat: add AI intent and connected workflow editor"
```

### Task 5: Add scheduling, Email templates, preview, and save validation

**Files:**
- Create: `src/components/SchedulePanel.tsx`
- Create: `src/components/EmailPreview.tsx`
- Create: `src/components/SchedulePanel.test.tsx`
- Modify: `src/components/TaskBuilder.tsx`

- [ ] **Step 1: Write failing validation and preview tests**

```tsx
// src/components/SchedulePanel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { SchedulePanel } from './SchedulePanel';
import { inferTask } from '../domain/inferTask';

it('blocks save, focuses recipient, and previews desktop and mobile email', async () => {
  const onSave = vi.fn();
  render(<SchedulePanel task={inferTask('搜尋雲林新聞明天發送')} onChange={() => {}} onSave={onSave} onTest={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: '儲存任務' }));
  expect(screen.getByText('請先填寫收件人，才能建立寄送 Email 任務。')).toBeInTheDocument();
  expect(screen.getByLabelText('收件人')).toHaveFocus();
  await userEvent.type(screen.getByLabelText('收件人'), 'owner@example.com');
  await userEvent.click(screen.getByRole('button', { name: '預覽 Email' }));
  expect(screen.getByRole('dialog', { name: 'Email 預覽' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '手機預覽' }));
  expect(screen.getByTestId('email-preview')).toHaveAttribute('data-viewport', 'mobile');
});
```

Run: `pnpm test -- src/components/SchedulePanel.test.tsx`

Expected: FAIL because scheduling and preview components do not exist.

- [ ] **Step 2: Implement sticky schedule summary and validation**

`SchedulePanel` renders frequency, date, time, enabled state, inferred-time notice, missing-field links, test, preview, and save buttons. On save, call `validateTask`; set `aria-describedby` on invalid fields, render the message next to the field, and focus the first invalid field via a stored ref.

- [ ] **Step 3: Implement Email template and responsive preview**

`EmailPreview` renders subject, intro, an `AI 摘要結果` content block, and outro. A segmented control toggles `data-viewport="desktop" | "mobile"`. Closing returns focus to `預覽 Email`. The dialog traps focus through native `<dialog>` semantics and has an explicit close button.

Run: `pnpm test -- src/components/SchedulePanel.test.tsx`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components src/domain
git commit -m "feat: add schedule validation and email preview"
```

### Task 6: Add test-run timeline, retry, records, and safe deletion

**Files:**
- Create: `src/components/TestRunPanel.tsx`
- Create: `src/components/TestRunPanel.test.tsx`
- Modify: `src/components/TaskBuilder.tsx`
- Modify: `src/components/TaskList.tsx`
- Modify: `src/components/TaskList.test.tsx`

- [ ] **Step 1: Write failing test-run and deletion tests**

```tsx
// src/components/TestRunPanel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { TestRunPanel } from './TestRunPanel';

it('shows each simulated test step and retries a failure', async () => {
  render(<TestRunPanel simulateFailureAt="step_2" onClose={() => {}} />);
  await userEvent.click(screen.getByRole('button', { name: '開始測試' }));
  expect(await screen.findByText('AI 整理內容測試失敗')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '重試 AI 整理內容' }));
  expect(await screen.findByText('Email 預覽已準備完成')).toBeInTheDocument();
});
```

```tsx
// add to src/components/TaskList.test.tsx
import { sampleTasks } from '../data/sampleTasks';

it('requires named confirmation before task deletion', async () => {
  const onDelete = vi.fn();
  render(<TaskList tasks={sampleTasks} onCreate={() => {}} onUpdate={() => {}} onDelete={onDelete} />);
  await userEvent.click(screen.getByRole('button', { name: '刪除 每日雲林新聞摘要' }));
  expect(screen.getByText('每日雲林新聞摘要將停止後續執行')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '確認刪除任務' }));
  expect(onDelete).toHaveBeenCalledWith('yunlin-daily');
});
```

Run: `pnpm test -- src/components/TestRunPanel.test.tsx src/components/TaskList.test.tsx`

Expected: FAIL.

- [ ] **Step 2: Implement the local test state machine**

`TestRunPanel` progresses `step_1 → step_2 → step_3` with running/success states. An optional `simulateFailureAt` prop produces one readable error for prototype demonstration and tests. Retry resumes at that step. Successful completion renders summaries for search, AI output, and the Email preview. It never invokes `onSave`.

- [ ] **Step 3: Implement list management**

Task list supports title search, readable status filter, next-run sorting, pause/activate, a records drawer, retry for error status, and a deletion dialog. Records use local sample entries and label each state in Chinese. Row actions remain visible at desktop widths and move into labelled buttons below the row on mobile.

Run: `pnpm test -- src/components/TestRunPanel.test.tsx src/components/TaskList.test.tsx`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components src/App.tsx
git commit -m "feat: add test runs and task management"
```

### Task 7: Add draft autosave, restore, and unsaved-change protection

**Files:**
- Create: `src/hooks/useDraft.ts`
- Create: `src/hooks/useDraft.test.tsx`
- Modify: `src/components/TaskBuilder.tsx`

- [ ] **Step 1: Write the failing draft test**

```tsx
it('restores an autosaved scheduler draft', async () => {
  localStorage.setItem('citygpt-scheduler-draft', JSON.stringify(inferTask('搜尋雲林新聞')));
  render(<TaskBuilder onCancel={() => {}} onSave={() => {}} />);
  expect(screen.getByText('找到尚未完成的草稿')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '繼續編輯草稿' }));
  expect(screen.getByDisplayValue('搜尋雲林新聞並寄出摘要')).toBeInTheDocument();
});
```

Run: `pnpm test -- src/hooks/useDraft.test.tsx`

Expected: FAIL.

- [ ] **Step 2: Implement draft persistence**

`useDraft` exposes `{ savedDraft, saveDraft, clearDraft }`. Serialize task changes after 400ms of inactivity. On builder entry show restore/discard choices. On successful save clear the draft. Register `beforeunload` only while `dirty` is true and remove the listener on cleanup.

Run: `pnpm test -- src/hooks/useDraft.test.tsx`

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/hooks src/components/TaskBuilder.tsx
git commit -m "feat: add scheduler draft recovery"
```

### Task 8: Apply CityGPT visual system and responsive accessibility

**Files:**
- Create: `src/styles.css`
- Modify: all component files for class names and accessible labels
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add semantic and keyboard assertions**

```tsx
// add to src/App.test.tsx
it('uses one page heading and exposes labelled controls', async () => {
  render(<App />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  await userEvent.click(screen.getByRole('button', { name: '建立新任務' }));
  expect(screen.getByLabelText('描述你想自動完成的任務')).toBeInTheDocument();
  expect(screen.getByRole('list', { name: '建立任務進度' })).toBeInTheDocument();
});

it('gives every task action an accessible name', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: '編輯 每日雲林新聞摘要' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '暫停 每日雲林新聞摘要' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '刪除 每日雲林新聞摘要' })).toBeInTheDocument();
});
```

Run: `pnpm test`

Expected: FAIL on missing semantics.

- [ ] **Step 2: Implement the visual tokens and layout**

```css
:root {
  font-family: Inter, "Noto Sans TC", system-ui, sans-serif;
  color: #172033;
  background: #f6f9ff;
  --blue-700: #1758d5;
  --blue-600: #236cf2;
  --blue-100: #eaf2ff;
  --line: #dce5f2;
  --muted: #667085;
  --success: #18794e;
  --warning: #a15c00;
  --danger: #c43232;
  --radius: 18px;
  --shadow: 0 14px 40px rgba(29, 78, 216, .10);
}
* { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
button, [role="button"], input, select { min-height: 44px; }
:focus-visible { outline: 3px solid rgba(35,108,242,.35); outline-offset: 2px; }
.builder-layout { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; align-items: start; }
.sticky-summary { position: sticky; top: 24px; }
.step-card { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); }
.status { display: inline-flex; align-items: center; gap: 6px; }
@media (max-width: 900px) {
  .builder-layout { grid-template-columns: 1fr; }
  .sticky-summary { position: static; }
}
@media (max-width: 640px) {
  .page { padding: 16px; }
  .desktop-table { display: none; }
  .mobile-task-cards { display: grid; }
}
```

Use Lucide icons beside text; never use emoji as the main icon. Preserve the staging product's blue/white direction, generous whitespace, rounded controls, and restrained status colors.

Run: `pnpm test && pnpm build`

Expected: all tests PASS and Vite build exits 0.

- [ ] **Step 3: Commit**

```bash
git add src
git commit -m "feat: finish responsive CityGPT scheduler UI"
```

### Task 9: Browser verification and handoff

**Files:**
- Modify as needed based on verified visual or interaction defects.
- Create: `README.md`

- [ ] **Step 1: Start the local prototype**

Run: `pnpm dev -- --port 4173`

Expected: `http://127.0.0.1:4173/` responds with the scheduler prototype.

- [ ] **Step 2: Verify the primary flow in the in-app browser**

At 1280×720, verify: create task, describe task, generate three steps, inspect automatic source chips, optimize rules without overwriting, fill recipient, switch Email preview widths, test run, save, return to list, filter, open records, pause, retry error, delete with confirmation, restore draft, and undo a source change.

Expected: every action has a visible state change, no real network mutation occurs, and no engineering variables appear outside advanced settings.

- [ ] **Step 3: Verify responsive behavior**

At 390×844 and 768×1024, repeat generation, recipient validation, Email preview, and save. Confirm no horizontal overflow, 44px controls, readable focus state, and the summary moves below the workflow.

- [ ] **Step 4: Add run instructions**

````md
# CityGPT AI 任務排程助理

## Run

```powershell
pnpm install
pnpm dev -- --port 4173
```

Open `http://127.0.0.1:4173/`. This prototype uses local simulated data and never creates a staging schedule or sends Email.
````

- [ ] **Step 5: Run final verification and commit**

Run: `pnpm test && pnpm build`

Expected: all tests PASS; build exits 0; browser checks pass at desktop, tablet, and mobile sizes.

```bash
git add README.md src
git commit -m "docs: add scheduler prototype handoff"
```
