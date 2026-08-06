import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

describe('CityGPT admin demo', () => {
  beforeEach(() => localStorage.clear())

  it('opens directly into the management backend', () => {
    render(<App />)

    expect(screen.getByText('AI知識代理人')).toBeInTheDocument()
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
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: /系統狀態/ })).not.toBeInTheDocument()
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

  it('shows SSO departments as read-only and filters users by department', () => {
    render(<App />)

    expect(screen.getByText('部門', { selector: '.admin-table-head span' })).toBeInTheDocument()
    expect(screen.getAllByText('民政處').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByLabelText(/王小明.*部門/)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('部門'), { target: { value: '民政處' } })

    expect(screen.getByText('王小明')).toBeInTheDocument()
    expect(screen.queryByText('林怡君')).not.toBeInTheDocument()
  })

  it('shows user feedback against a specific agent answer segment', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /回饋管理/ }))

    expect(screen.getByLabelText('開始日期')).toBeInTheDocument()
    expect(screen.getByLabelText('結束日期')).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: '共 6 筆回饋，正向 50%，負向 50%' }),
    ).toBeInTheDocument()
    expect(screen.getByText('正向回饋')).toBeInTheDocument()
    expect(screen.getByText('負向回饋')).toBeInTheDocument()
    expect(screen.getAllByText('3 筆')).toHaveLength(2)
    expect(screen.getAllByText('50%')).toHaveLength(2)
    expect(screen.getByText('7–10 分列為正向；1–6 分列為負向。')).toBeInTheDocument()
    expect(screen.getAllByText('3/10').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText('部門')).toBeInTheDocument()
    expect(screen.getByLabelText('代理人')).toBeInTheDocument()
    expect(screen.getAllByText('王小明').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('民政處').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('民政服務代理人').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('使用者問題')).toBeInTheDocument()
    expect(screen.getByText('被評分的回答段落')).toBeInTheDocument()
    expect(screen.getByText('使用者留言')).toBeInTheDocument()
    expect(
      screen.getByText('只回答一種補助，沒有說明可以一起申請的限制。'),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('回饋評分')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('處理狀態')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('負責小組')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('新增標籤')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/管理者備註/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '儲存管理者備註' })).toBeInTheDocument()
    expect(screen.getByText(/管理者處理備註上限 200 字/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('結束日期'), { target: { value: '2026-07-04' } })
    expect(
      screen.getByRole('img', { name: '共 3 筆回饋，正向 67%，負向 33%' }),
    ).toBeInTheDocument()
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
    expect(screen.queryByText('成功代表')).not.toBeInTheDocument()
    expect(screen.queryByText('失敗代表')).not.toBeInTheDocument()
    expect(screen.getByText('哪些錯誤會被記錄？')).toBeInTheDocument()
    expect(screen.getByText(/密碼輸錯、可疑 IP／地點/)).toBeInTheDocument()
    expect(screen.getByText(/SharePoint 等文件的實際下載/)).toBeInTheDocument()
    expect(screen.getByText(/一般 AI 提問只做用量與品質統計/)).toBeInTheDocument()
    expect(screen.getByText('為什麼被記錄')).toBeInTheDocument()
    expect(screen.getByText('錯誤原因')).toBeInTheDocument()
    expect(screen.queryByLabelText('結果')).not.toBeInTheDocument()
    expect(screen.getAllByText(/IT/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/admin/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows completed-period usage rankings and keeps monitoring alerts separate', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /使用統計/ }))

    expect(screen.getByRole('button', { name: '日' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '月' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '年' })).toBeInTheDocument()
    expect(screen.getByLabelText('開始月份')).toBeInTheDocument()
    expect(screen.getByLabelText('結束月份')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '日' }))
    expect(screen.getByLabelText('開始日期')).toBeInTheDocument()
    expect(screen.getByLabelText('結束日期')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('開始日期'), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByLabelText('結束日期'), { target: { value: '2026-08-05' } })
    expect(screen.getAllByText(/2026\/08\/01－2026\/08\/05/).length).toBeGreaterThanOrEqual(1)
    fireEvent.click(screen.getByRole('button', { name: '年' }))
    expect(screen.getByLabelText('開始年度')).toBeInTheDocument()
    expect(screen.getByLabelText('結束年度')).toBeInTheDocument()
    expect(screen.getByText('使用人數')).toBeInTheDocument()
    expect(screen.getByText(/至少成功送出 1 次提問的去重人數/)).toBeInTheDocument()
    expect(screen.getByText('每人每月用量排名（前 10 名）')).toBeInTheDocument()
    expect(screen.getByText('部門提問次數排名（前 10 名）')).toBeInTheDocument()
    expect(screen.getByText('KMS 引用文件排名')).toBeInTheDocument()
    expect(screen.getByText('統計報表需求待縣府確認')).toBeInTheDocument()
    expect(screen.queryByText('各功能使用頻率')).not.toBeInTheDocument()
    expect(screen.queryByText('AI 使用量')).not.toBeInTheDocument()
    expect(screen.queryByText('平均回覆時間')).not.toBeInTheDocument()
    expect(screen.queryByText('用量異常')).not.toBeInTheDocument()
    expect(screen.queryByText('找不到答案 / 低相關度')).not.toBeInTheDocument()
    expect(screen.queryByText('負向回饋與未解決')).not.toBeInTheDocument()
    expect(screen.queryByText('正向回饋率')).not.toBeInTheDocument()
    expect(screen.queryByText('角色提問次數')).not.toBeInTheDocument()
    expect(screen.queryByText('監控狀態')).not.toBeInTheDocument()
    expect(screen.queryByText('監控端告警')).not.toBeInTheDocument()
    expect(screen.queryByText('未告警')).not.toBeInTheDocument()
    expect(screen.getByText('382,400')).toBeInTheDocument()
    expect(screen.getByText('268,900')).toBeInTheDocument()
    expect(
      screen.getByRole('table', { name: '每人每月用量排名' }).querySelectorAll('[role="row"]')
        .length,
    ).toBeLessThanOrEqual(11)
  })

  it('removes the system status page from this management scope', () => {
    render(<App />)

    expect(screen.queryByRole('button', { name: /系統狀態/ })).not.toBeInTheDocument()
    expect(screen.queryByText('AI 回答可用狀態')).not.toBeInTheDocument()
    expect(screen.queryByText('知識代理人管理')).not.toBeInTheDocument()
  })
})
