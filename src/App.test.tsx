import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

describe('CityGPT admin demo', () => {
  beforeEach(() => localStorage.clear())

  it('opens directly into the management backend', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: '使用者與權限' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '管理後臺' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '回到任務排程' })).not.toBeInTheDocument()
  })

  it('shows the PRD-aligned backend areas in the sidebar', () => {
    render(<App />)

    expect(screen.getByRole('navigation', { name: '管理後臺導覽' })).toBeInTheDocument()
    for (const label of [
      '使用者與權限',
      '稽核日誌',
      '使用統計',
      '回饋管理',
      '系統狀態',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: /知識代理人管理/ })).not.toBeInTheDocument()
  })

  it('shows role dropdowns directly in user row actions', () => {
    render(<App />)

    expect(screen.queryByRole('heading', { name: '角色設定' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '有效權限' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('王小明 權限類型')).toBeInTheDocument()
    expect(screen.getAllByText('一般USER').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('管理者').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('管理知識代理人')).not.toBeInTheDocument()
  })

  it('shows SSO account status as read-only and removes local disable controls', () => {
    render(<App />)

    expect(screen.getByText('SSO 使用者清單')).toBeInTheDocument()
    expect(screen.getByText('帳號生命週期以 SSO 為準')).toBeInTheDocument()
    expect(screen.getAllByText('SSO 有效').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('SSO 停用').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('同步異常').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('button', { name: '新增使用者' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '停用' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: '確認停用使用者' })).not.toBeInTheDocument()
  })

  it('shows feedback rating as a 1 to 10 score', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /回饋管理/ }))

    expect(screen.getByText('平均評分')).toBeInTheDocument()
    expect(screen.getByText('正向回饋率目標 70%')).toBeInTheDocument()
    expect(screen.getByText(/評分 3\/10/)).toBeInTheDocument()
    expect(screen.getByLabelText('回饋評分')).toBeInTheDocument()
    expect(screen.getByText(/文字意見上限 200 字/)).toBeInTheDocument()
  })

  it('shows token usage anomaly rules in audit logs', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /稽核日誌/ }))

    expect(screen.getByText('保存期限')).toBeInTheDocument()
    expect(screen.getAllByText(/180 天/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText(/操作類型/)).toBeInTheDocument()
    expect(screen.getAllByText('Token 用量異常').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Token 用量異常規則')).toBeInTheDocument()
    expect(screen.getByText(/300,000 tokens \/ 月/)).toBeInTheDocument()
    expect(screen.getByText('成功代表')).toBeInTheDocument()
    expect(screen.getByText('失敗代表')).toBeInTheDocument()
    expect(screen.getByText('哪些事項會被稽核？')).toBeInTheDocument()
    expect(screen.getByText(/一般 AI 提問只做用量與品質統計/)).toBeInTheDocument()
    expect(screen.getByText('為什麼被記錄')).toBeInTheDocument()
    expect(screen.getByText('系統判定')).toBeInTheDocument()
    expect(screen.getAllByText(/IT/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/admin/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows per-user traffic statistics without turning every usage into an audit log', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /使用統計/ }))

    expect(screen.getByRole('button', { name: '日' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '週' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '月' })).toBeInTheDocument()
    expect(screen.getByText('AI 使用量')).toBeInTheDocument()
    expect(screen.getByText('部門與角色用量')).toBeInTheDocument()
    expect(screen.getByText('常被引用文件')).toBeInTheDocument()
    expect(screen.getByText('找不到答案 / 低相關度')).toBeInTheDocument()
    expect(screen.getByText('個人月用量監控')).toBeInTheDocument()
    expect(screen.queryByText('各功能使用頻率')).not.toBeInTheDocument()
    expect(screen.queryByText('流量統計怎麼記？')).not.toBeInTheDocument()
    expect(screen.queryByText('總提問數怎麼算？')).not.toBeInTheDocument()
    expect(screen.getByText('382,400')).toBeInTheDocument()
    expect(screen.getByText('已 alert')).toBeInTheDocument()
    expect(screen.getByText('觀察')).toBeInTheDocument()
  })

  it('shows a lightweight system status page instead of a heavy RAG management page', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /系統狀態/ }))

    expect(screen.getByRole('heading', { name: 'AI 回答可用狀態' })).toBeInTheDocument()
    expect(screen.getByText('這頁對縣府的幫助')).toBeInTheDocument()
    expect(screen.getByText('AI 已可引用')).toBeInTheDocument()
    expect(screen.getByText('可能影響回答')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '這份文件會不會影響回答？' })).toBeInTheDocument()
    expect(screen.getByText('回答可用性')).toBeInTheDocument()
    expect(screen.getByText('建議處理')).toBeInTheDocument()
    expect(screen.getByText('同步文件')).toBeInTheDocument()
    expect(screen.getByText('讀取內容')).toBeInTheDocument()
    expect(screen.getByText('建立 AI 可搜尋資料')).toBeInTheDocument()
    expect(screen.getByText('重新執行')).toBeInTheDocument()
    expect(screen.queryByText('知識代理人管理')).not.toBeInTheDocument()
  })
})
