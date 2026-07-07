import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  CirclePause,
  Clock3,
  Eye,
  FileClock,
  FlaskConical,
  Info,
  ListFilter,
  Mail,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import AdminApp from './admin/AdminApp'
import { inferTask } from './domain/inferTask'
import type { SchedulerTask, TaskStatus } from './domain/scheduler'
import { validateTask } from './domain/validation'

type View = 'list' | 'builder'
type Surface = 'scheduler' | 'admin'
type SampleTask = {
  id: string
  name: string
  summary: string
  nextRun: string
  status: TaskStatus
}

const DRAFT_KEY = 'ai-scheduler-draft'

const sampleTasks: SampleTask[] = [
  { id: '1', name: '每週產業新聞快報', summary: '搜尋資料 → AI 整理 → Email 寄送', nextRun: '明天 08:30', status: 'active' },
  { id: '2', name: '每日競品動態摘要', summary: '搜尋資料 → AI 整理 → Email 寄送', nextRun: '今天 17:00', status: 'error' },
  { id: '3', name: '主管會議重點整理', summary: '搜尋資料 → AI 整理 → Email 寄送', nextRun: '每週一 09:00', status: 'paused' },
  { id: '4', name: '地方創生案例月報', summary: '搜尋資料 → AI 整理 → Email 寄送', nextRun: '已於 6/30 完成', status: 'completed' },
  { id: '5', name: '農業政策追蹤', summary: '尚未完成設定', nextRun: '尚未排程', status: 'draft' },
]

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  active: { label: '執行中', className: 'active' },
  paused: { label: '已暫停', className: 'paused' },
  error: { label: '需處理', className: 'error' },
  completed: { label: '已完成', className: 'completed' },
  draft: { label: '草稿', className: 'draft' },
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" className="icon-button" aria-label={label} title={label} onClick={onClick}>{children}</button>
}

function Modal({ title, children, onClose, className = '' }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header"><div><p className="eyebrow">AI 任務排程</p><h2>{title}</h2></div><IconButton label="關閉視窗" onClick={onClose}><X size={20} /></IconButton></header>
        {children}
      </section>
    </div>
  )
}

function TaskList({ onCreate, onEdit, onOpenAdmin }: { onCreate: () => void; onEdit: () => void; onOpenAdmin: () => void }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('ai-scheduler-saved-task')
    return saved ? [JSON.parse(saved) as SampleTask, ...sampleTasks] : sampleTasks
  })
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | TaskStatus>('all')
  const [sort, setSort] = useState('soon')
  const [recordsTask, setRecordsTask] = useState<SampleTask | null>(null)
  const [deleteTask, setDeleteTask] = useState<SampleTask | null>(null)
  const [openActions, setOpenActions] = useState<string | null>(null)

  const visibleTasks = useMemo(() => tasks
    .filter((task) => status === 'all' || task.status === status)
    .filter((task) => task.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'zh-Hant') : a.id.localeCompare(b.id)), [tasks, query, status, sort])

  const toggleTask = (target: SampleTask) => setTasks((current) => current.map((task) => task.id === target.id ? { ...task, status: task.status === 'active' ? 'paused' : 'active' } : task))

  return (
    <main className="page-shell list-page">
      <header className="topbar"><a className="brand" href="#" aria-label="CityGPT 首頁"><span className="brand-mark">C</span><span>CityGPT</span></a><div className="topbar-actions"><button className="admin-entry-button" type="button" onClick={onOpenAdmin}>管理後臺</button><span className="environment">Prototype</span><span className="avatar">U1</span></div></header>
      <div className="content-wrap">
        <section className="hero-row">
          <div><p className="eyebrow">智慧自動化</p><h1>AI 任務排程</h1><p className="subtitle">用自然語言描述工作，AI 會幫你規劃流程、整理內容並準時完成。</p></div>
          <button className="primary-button create-button" type="button" onClick={onCreate}><Plus size={18} />建立新任務</button>
        </section>

        <nav className="task-tabs" aria-label="任務分類">
          <button className="tab active" type="button" onClick={() => setStatus('all')}>全部 <span>{tasks.length}</span></button>
          <button className="tab" type="button" onClick={() => setStatus('active')}>執行中 <span>{tasks.filter((t) => t.status === 'active').length}</span></button>
          <button className="tab" type="button" onClick={() => setStatus('draft')}>草稿 <span>{tasks.filter((t) => t.status === 'draft').length}</span></button>
        </nav>

        <section className="task-panel">
          <div className="toolbar">
            <label className="search-field"><Search size={18} /><span className="sr-only">搜尋任務</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋任務名稱" /></label>
            <div className="select-group"><ListFilter size={17} /><label><span className="sr-only">狀態篩選</span><select aria-label="狀態篩選" value={status} onChange={(event) => setStatus(event.target.value as 'all' | TaskStatus)}><option value="all">所有狀態</option><option value="active">執行中</option><option value="paused">已暫停</option><option value="error">需處理</option><option value="completed">已完成</option><option value="draft">草稿</option></select></label></div>
            <label className="sort-field"><span>排序</span><select aria-label="下次執行排序" value={sort} onChange={(event) => setSort(event.target.value)}><option value="soon">下次執行時間</option><option value="name">任務名稱</option></select></label>
          </div>

          <div className="task-table" role="table" aria-label="排程任務">
            <div className="task-row table-head" role="row"><span>任務名稱</span><span>流程</span><span>下次執行</span><span>狀態</span><span>操作</span></div>
            {visibleTasks.map((task) => (
              <article className="task-row" role="row" key={task.id}>
                <div className="task-name"><span className="task-icon"><CalendarClock size={19} /></span><div><strong>{task.name}</strong><small>更新於 2 小時前</small></div></div>
                <div className="flow-summary"><span>{task.summary}</span></div>
                <div className="next-run"><Clock3 size={16} />{task.nextRun}</div>
                <div><span className={`status-pill ${statusMeta[task.status].className}`}>{task.status === 'error' && <AlertCircle size={14} />}{statusMeta[task.status].label}</span></div>
                <div className="row-actions">
                  <button type="button" className="text-action" onClick={onEdit}><Pencil size={16} />編輯</button>
                  <button type="button" className="text-action" onClick={() => setRecordsTask(task)}><FileClock size={16} />查看紀錄</button>
                  {task.status === 'error' && <button type="button" className="text-action accent"><RefreshCw size={16} />重試</button>}
                  <IconButton label={`刪除 ${task.name}`} onClick={() => setDeleteTask(task)}><Trash2 size={17} /></IconButton>
                  <div className="more-wrap"><IconButton label={`更多操作 ${task.name}`} onClick={() => setOpenActions(openActions === task.id ? null : task.id)}><MoreHorizontal size={19} /></IconButton>{openActions === task.id && <div className="action-menu"><button type="button"><FlaskConical size={16} />測試</button><button type="button" onClick={() => toggleTask(task)}>{task.status === 'active' ? <Pause size={16} /> : <Play size={16} />}{task.status === 'active' ? '暫停' : '啟用'}</button></div>}</div>
                </div>
              </article>
            ))}
            {!visibleTasks.length && <div className="empty-state"><Search size={28} /><strong>找不到符合條件的任務</strong><span>試試其他關鍵字或狀態。</span></div>}
          </div>
        </section>
      </div>

      {recordsTask && <Modal title="執行紀錄" onClose={() => setRecordsTask(null)}><div className="modal-body"><h3>{recordsTask.name}</h3><div className="record-list"><div><Check size={18} /><span><strong>流程執行完成</strong><small>今天 08:31 · 共處理 12 則資料</small></span></div><div><Check size={18} /><span><strong>Email 已建立預覽</strong><small>今天 08:30 · 未實際寄送</small></span></div></div></div></Modal>}
      {deleteTask && <Modal title="確認刪除任務" onClose={() => setDeleteTask(null)}><div className="modal-body delete-copy"><div className="danger-icon"><Trash2 size={22} /></div><p>你即將刪除「<strong>{deleteTask.name}</strong>」。</p><dl><div><dt>下次執行</dt><dd>{deleteTask.nextRun}</dd></div><div><dt>影響</dt><dd>刪除後將無法執行後續排程，過去紀錄也會一併移除。</dd></div></dl><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setDeleteTask(null)}>取消</button><button className="danger-button" type="button" onClick={() => { setTasks((current) => current.filter((task) => task.id !== deleteTask.id)); setDeleteTask(null) }}>確認刪除</button></div></div></Modal>}
    </main>
  )
}

function StepHeader({ number, title, icon, expanded, onToggle, status = '已設定' }: { number: number; title: string; icon: React.ReactNode; expanded: boolean; onToggle: () => void; status?: string }) {
  return <button type="button" className="step-header" onClick={onToggle} aria-expanded={expanded}><span className="step-number">{number}</span><span className="step-kind-icon">{icon}</span><span className="step-title"><small>STEP {number}</small><h3>{title}</h3></span><span className="step-state"><Check size={14} />{status}</span>{expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</button>
}

function Builder({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const [description, setDescription] = useState('搜尋雲林相關新聞明天發送')
  const [task, setTask] = useState<SchedulerTask | null>(null)
  const [generated, setGenerated] = useState(false)
  const [expanded, setExpanded] = useState(1)
  const [rulesSuggestion, setRulesSuggestion] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [advancedChanged, setAdvancedChanged] = useState(false)
  const [preview, setPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [testRun, setTestRun] = useState(false)
  const [testComplete, setTestComplete] = useState(0)
  const [restoreDraft, setRestoreDraft] = useState(false)
  const [savedIndicator, setSavedIndicator] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const recipientRef = useRef<HTMLInputElement>(null)
  const previewButtonRef = useRef<HTMLButtonElement>(null)
  const autosaveReady = useRef(false)

  useEffect(() => {
    if (localStorage.getItem(DRAFT_KEY)) setRestoreDraft(true)
    const timer = window.setTimeout(() => { autosaveReady.current = true }, 100)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!dirty || !autosaveReady.current) return
    const timer = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ description, recipient: task?.steps[2].fields.recipient ?? '' }))
      setSavedIndicator(true)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [description, task, dirty])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  useEffect(() => {
    if (!testRun) return
    setTestComplete(0)
    const one = window.setTimeout(() => setTestComplete(1), 160)
    const two = window.setTimeout(() => setTestComplete(2), 320)
    const three = window.setTimeout(() => setTestComplete(3), 480)
    return () => [one, two, three].forEach(window.clearTimeout)
  }, [testRun])

  const updateStepField = (stepIndex: number, field: string, value: string) => {
    setDirty(true)
    setSavedIndicator(false)
    setTask((current) => current ? { ...current, steps: current.steps.map((step, index) => index === stepIndex ? { ...step, fields: { ...step.fields, [field]: value } } : step) } : current)
  }

  const generate = () => { setTask(inferTask(description)); setGenerated(true); setExpanded(2); setDirty(true); setError('') }
  const closePreview = () => { setPreview(false); window.setTimeout(() => previewButtonRef.current?.focus(), 0) }
  const save = () => {
    if (!task) return
    const issues = validateTask(task)
    if (issues.length) { setError(issues[0].message); if (issues[0].field === 'recipient') { setExpanded(3); window.setTimeout(() => recipientRef.current?.focus(), 0) }; return }
    localStorage.setItem('ai-scheduler-saved-task', JSON.stringify({ id: `saved-${Date.now()}`, name: task.title, summary: '搜尋資料 → AI 整理 → Email 寄送', nextRun: `明天 ${task.schedule.time}`, status: 'active' }))
    localStorage.removeItem(DRAFT_KEY)
    setDirty(false)
    onSaved()
  }
  const restore = () => {
    const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') as { description?: string; recipient?: string }
    const restoredDescription = data.description || description
    const restoredTask = inferTask(restoredDescription)
    restoredTask.steps[2].fields.recipient = data.recipient || ''
    setDescription(restoredDescription); setTask(restoredTask); setGenerated(true); setRestoreDraft(false); setDirty(false)
  }

  const rules = task?.steps[1].fields.rules ?? ''
  const suggestedRules = '以主管可快速閱讀的格式整理：列出 5 則重要新聞，每則包含標題、來源、日期、兩句摘要、可能影響及建議追蹤；若資料不足請清楚標示。'

  return (
    <main className="page-shell builder-page">
      <header className="topbar builder-topbar"><button className="back-button" type="button" onClick={onBack}><ArrowLeft size={19} />返回任務列表</button><a className="brand" href="#"><span className="brand-mark">C</span><span>CityGPT</span></a><span className={`draft-indicator ${savedIndicator ? 'saved' : ''}`}>{savedIndicator ? <><Check size={15} />草稿已儲存</> : '編輯中的草稿'}</span></header>
      <div className="builder-container">
        <section className="builder-heading"><p className="eyebrow">建立新的自動化</p><h1>建立 AI 任務</h1><p>告訴我們你想完成什麼，其他設定交給 AI 幫你準備。</p></section>
        <ol className="progress-steps">
          {['描述任務', '確認流程', '補齊資料', '測試與儲存'].map((label, index) => <li className={generated ? (index < 3 ? 'done' : 'current') : (index === 0 ? 'current' : '')} key={label}><span>{generated && index < 3 ? <Check size={15} /> : index + 1}</span><strong>{label}</strong></li>)}
        </ol>

        <div className="builder-layout">
          <div className="builder-main">
            <section className="card prompt-card">
              <div className="section-title"><span className="title-icon"><Sparkles size={20} /></span><div><h2>描述你想自動完成的任務</h2><p>用你平常說話的方式就可以，不需要設定技術參數。</p></div></div>
              <label><span className="sr-only">描述你想自動完成的任務</span><textarea aria-label="描述你想自動完成的任務" value={description} onChange={(event) => { setDescription(event.target.value); setDirty(true); setSavedIndicator(false) }} rows={4} /></label>
              <div className="prompt-footer"><span>例如：每天早上整理產業新聞，寄給主管</span><button className="primary-button" type="button" onClick={generate}><Sparkles size={17} />AI 幫我建立流程</button></div>
            </section>

            {generated && task && <>
              <div className="success-banner"><span><Check size={19} /></span><div><strong>已為你建立 3 個步驟</strong><p>流程已自動串接。請再確認收件人與明天的寄送時間。</p></div></div>

              <section className="card intent-card"><div className="section-title compact"><div><h2>我理解的任務</h2><p>你可以直接修改，AI 建議的內容會特別標示。</p></div></div><div className="intent-grid">{task.intent.map((field, index) => <label key={field.label}><span>{field.label}<small className={field.source === 'ai' ? 'ai-tag' : 'user-tag'}>{field.source === 'ai' ? 'AI 建議' : '依照你的描述'}</small></span><input value={field.value} onChange={(event) => setTask({ ...task, intent: task.intent.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item) })} /></label>)}</div></section>

              <section className="workflow-section"><div className="workflow-title"><div><h2>任務流程</h2><p>系統會照順序完成以下工作。</p></div><span className="connection-note"><Check size={15} />已自動串接資料</span></div>
                <article className={`step-card ${expanded === 1 ? 'expanded' : ''}`}><StepHeader number={1} title="搜尋資料" icon={<Search size={19} />} expanded={expanded === 1} onToggle={() => setExpanded(expanded === 1 ? 0 : 1)} />{expanded === 1 && <div className="step-content"><div className="field-grid"><label><span>搜尋關鍵字</span><input value={task.steps[0].fields.query} onChange={(event) => updateStepField(0, 'query', event.target.value)} /></label><label><span>搜尋範圍</span><select value={task.steps[0].fields.scope} onChange={(event) => updateStepField(0, 'scope', event.target.value)}><option>最新網路新聞與官方網站</option><option>僅官方網站</option><option>新聞網站</option></select></label></div><div className="output-row"><span className="output-chip"><Check size={14} />產生：搜尋結果</span></div><details><summary><Info size={15} />為什麼這樣設定</summary><p>任務提到「相關新聞」，因此優先搜尋近期新聞與地方政府官方來源。</p></details></div>}</article>
                <div className="step-connector"><ChevronDown size={16} /></div>
                <article className={`step-card ${expanded === 2 ? 'expanded' : ''}`}><StepHeader number={2} title="AI 整理內容" icon={<Sparkles size={19} />} expanded={expanded === 2} onToggle={() => setExpanded(expanded === 2 ? 0 : 2)} />{expanded === 2 && <div className="step-content"><div className="source-chip"><RefreshCw size={14} />自動使用：Step 1 搜尋結果</div><label><span>整理規則</span><textarea aria-label="整理規則" rows={5} value={rules} onChange={(event) => updateStepField(1, 'rules', event.target.value)} /></label><button className="secondary-button optimize-button" type="button" onClick={() => setRulesSuggestion(true)}><Sparkles size={16} />幫我優化整理規則</button>{rulesSuggestion && <div className="suggestion-box"><div className="suggestion-columns"><div><small>目前版本</small><p>{rules}</p></div><div className="suggested"><small>AI 建議版本</small><p>{suggestedRules}</p></div></div><div className="suggestion-actions"><button className="ghost-button" type="button" onClick={() => setRulesSuggestion(false)}>保留原本</button><button className="primary-button small" type="button" onClick={() => { updateStepField(1, 'rules', suggestedRules); setRulesSuggestion(false) }}>套用建議</button></div></div>}<div className="output-row"><span className="output-chip"><Check size={14} />產生：AI 摘要結果</span></div><details><summary><Info size={15} />為什麼這樣設定</summary><p>這種結構能讓主管快速掌握重點，同時保留來源以便查證。</p></details></div>}</article>
                <div className="step-connector"><ChevronDown size={16} /></div>
                <article className={`step-card ${expanded === 3 ? 'expanded' : ''}`}><StepHeader number={3} title="寄送 Email" icon={<Mail size={19} />} expanded={expanded === 3} onToggle={() => setExpanded(expanded === 3 ? 0 : 3)} status={task.steps[2].fields.recipient ? '已設定' : '待補資料'} />{expanded === 3 && <div className="step-content"><div className="source-chip"><RefreshCw size={14} />自動使用：Step 2 AI 摘要結果</div>{error && <div className="validation-error" role="alert"><AlertCircle size={17} />{error}</div>}<div className="field-grid"><label><span>收件人 <em>必填</em></span><input ref={recipientRef} aria-label="收件人" placeholder="name@company.com" value={task.steps[2].fields.recipient} onChange={(event) => { updateStepField(2, 'recipient', event.target.value); setError('') }} /></label><label><span>Email 主旨</span><input value={task.steps[2].fields.subject} onChange={(event) => updateStepField(2, 'subject', event.target.value)} /></label></div><label><span>信件內容來源</span><input value="AI 摘要結果" readOnly /></label><div className="field-grid"><label><span>開場文字（選填）</span><textarea rows={3} value={task.steps[2].fields.intro} onChange={(event) => updateStepField(2, 'intro', event.target.value)} /></label><label><span>結尾文字（選填）</span><textarea rows={3} value={task.steps[2].fields.outro} onChange={(event) => updateStepField(2, 'outro', event.target.value)} /></label></div><details><summary><Info size={15} />為什麼這樣設定</summary><p>主旨與內文已依照新聞摘要任務準備，可在寄送前預覽。</p></details></div>}</article>
              </section>

              <section className="advanced-section"><button type="button" className="advanced-toggle" onClick={() => setAdvanced(!advanced)}><Settings2 size={18} /><span><strong>進階設定</strong><small>僅在需要調整資料來源時使用</small></span>{advanced ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>{advanced && <div className="advanced-content"><div className="advanced-warning"><AlertCircle size={17} />變更資料來源會影響後續步驟，儲存前請重新測試。</div><label className="checkbox-row"><input type="checkbox" defaultChecked onChange={() => setAdvancedChanged(true)} />AI 整理內容使用搜尋結果 <code>step_1_output</code></label><label className="checkbox-row"><input type="checkbox" defaultChecked onChange={() => setAdvancedChanged(true)} />Email 使用摘要結果 <code>step_2_output</code></label>{advancedChanged && <button className="ghost-button undo-button" type="button" onClick={() => setAdvancedChanged(false)}><RotateCcw size={16} />復原上一步變更</button>}</div>}</section>
            </>}
          </div>

          <aside className="summary-panel">
            <div className="summary-heading"><h2>任務摘要</h2><span className="status-pill draft">草稿</span></div>
            {!generated ? <div className="summary-empty"><Sparkles size={24} /><p>描述任務後，這裡會顯示 AI 建議的流程與排程。</p></div> : <><div className={`missing-box ${task?.steps[2].fields.recipient ? 'complete' : ''}`}>{task?.steps[2].fields.recipient ? <Check size={18} /> : <AlertCircle size={18} />}<div><strong>{task?.steps[2].fields.recipient ? '必要資料已齊全' : '還差 1 項資料'}</strong><span>{task?.steps[2].fields.recipient ? '可以預覽、測試並儲存' : '請填寫 Email 收件人'}</span></div></div>{expanded !== 3 && <label className="summary-recipient"><span>收件人</span><input aria-label="收件人" placeholder="name@company.com" value={task?.steps[2].fields.recipient ?? ''} onChange={(event) => { updateStepField(2, 'recipient', event.target.value); setError('') }} /></label>}<dl className="summary-list"><div><dt><RefreshCw size={16} />執行頻率</dt><dd>執行一次</dd></div><div><dt><CalendarClock size={16} />執行日期</dt><dd>{task?.schedule.date}</dd></div><div><dt><Clock3 size={16} />執行時間</dt><dd>{task?.schedule.time}</dd></div><div><dt><CirclePause size={16} />任務狀態</dt><dd>建立後啟用</dd></div></dl><div className="inferred-note"><Info size={16} /><p>你提到「明天」，但沒有指定時間，因此暫定為明天 08:30。</p></div></>}
            <div className="summary-actions"><button ref={previewButtonRef} className="secondary-button full" type="button" disabled={!generated} onClick={() => setPreview(true)}><Eye size={17} />預覽 Email</button><button className="secondary-button full" type="button" disabled={!generated} onClick={() => setTestRun(true)}><FlaskConical size={17} />測試執行</button><button className="primary-button full" type="button" disabled={!generated} onClick={save}><Send size={17} />儲存任務</button><p>測試不會寄送 Email，也不會儲存任務。</p></div>
          </aside>
        </div>
      </div>

      {preview && task && <Modal title="Email 預覽" onClose={closePreview} className="preview-modal"><div className="preview-toolbar"><div className="segmented"><button className={previewMode === 'desktop' ? 'active' : ''} type="button" onClick={() => setPreviewMode('desktop')}>桌面</button><button className={previewMode === 'mobile' ? 'active' : ''} type="button" onClick={() => setPreviewMode('mobile')}>手機</button></div><span>僅供預覽，不會實際寄送</span></div><div className={`email-preview ${previewMode}`} data-testid="email-preview"><div className="email-meta"><span>寄件人</span><strong>CityGPT AI 任務助理</strong><span>收件人</span><strong>{task.steps[2].fields.recipient || '尚未填寫'}</strong><span>主旨</span><strong>{task.steps[2].fields.subject}</strong></div><div className="email-body"><p>{task.steps[2].fields.intro}</p><h3>今日雲林新聞重點</h3><article><span>01</span><div><strong>雲林智慧農業示範計畫啟動</strong><small>雲林縣政府 · 今日 09:10</small><p>計畫將導入環境感測與作物生長分析，協助農民提升管理效率，預計先於三個鄉鎮推動。</p></div></article><article><span>02</span><div><strong>地方創生團隊推出青年共創基地</strong><small>地方新聞 · 昨日 16:40</small><p>新基地整合創業輔導、空間媒合與在地品牌資源，將於本季開放申請。</p></div></article><p>{task.steps[2].fields.outro}</p></div></div><div className="modal-actions"><button className="primary-button" type="button" onClick={closePreview}>關閉</button></div></Modal>}

      {testRun && <Modal title="測試執行" onClose={() => setTestRun(false)}><div className="modal-body"><div className="test-notice"><FlaskConical size={19} /><span><strong>這是安全測試</strong><small>只會使用本機模擬資料，不會儲存任務或寄送信件。</small></span></div><div className="timeline">{['搜尋資料', 'AI 整理內容', '建立 Email 預覽'].map((label, index) => { const done = testComplete > index; const running = testComplete === index; return <div className={done ? 'done' : running ? 'running' : ''} key={label}><span className="timeline-icon">{done ? <Check size={16} /> : running ? <RefreshCw className="spin" size={16} /> : <Clock3 size={16} />}</span><span><strong>{label}</strong><small>{done ? '完成' : running ? '執行中…' : '等待中'}</small></span></div> })}</div>{testComplete === 3 && <div className="test-success"><Check size={18} />測試完成，流程可以正常執行。</div>}<div className="modal-actions"><button className="primary-button" type="button" disabled={testComplete < 3} onClick={() => setTestRun(false)}>完成測試</button></div></div></Modal>}

      {restoreDraft && <Modal title="找到未完成草稿" onClose={() => setRestoreDraft(false)}><div className="modal-body"><p>我們在這台裝置上找到上次未完成的任務。要繼續編輯嗎？</p><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => { localStorage.removeItem(DRAFT_KEY); setRestoreDraft(false) }}>捨棄草稿</button><button className="primary-button" type="button" onClick={restore}>恢復草稿</button></div></div></Modal>}
    </main>
  )
}

export default function App() {
  return <AdminApp />
}
