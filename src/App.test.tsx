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

  it('shows the four required backend areas in the sidebar', () => {
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

  it('shows feedback rating as a 1 to 10 score', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /回饋管理/ }))

    expect(screen.getByText('平均評分')).toBeInTheDocument()
    expect(screen.getByText(/評分 3\/10/)).toBeInTheDocument()
    expect(screen.getByLabelText('回饋評分')).toBeInTheDocument()
  })

  it('shows token usage anomaly rules in audit logs', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /稽核日誌/ }))

    expect(screen.getAllByText('Token 用量異常').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Token 用量異常規則')).toBeInTheDocument()
    expect(screen.getByText(/300,000 tokens \/ 月/)).toBeInTheDocument()
    expect(screen.getAllByText(/IT/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/admin/).length).toBeGreaterThanOrEqual(1)
  })

  it('shows per-user traffic statistics without turning every usage into an audit log', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /使用統計/ }))

    expect(screen.getByText('流量統計怎麼記？')).toBeInTheDocument()
    expect(screen.getByText('個人月用量監控')).toBeInTheDocument()
    expect(screen.getByText('每個人都記錄')).toBeInTheDocument()
    expect(screen.getByText('不全部進稽核')).toBeInTheDocument()
    expect(screen.getByText('異常才發 alert')).toBeInTheDocument()
    expect(screen.getByText('382,400')).toBeInTheDocument()
    expect(screen.getByText('已 alert')).toBeInTheDocument()
    expect(screen.getByText('觀察')).toBeInTheDocument()
  })
})
