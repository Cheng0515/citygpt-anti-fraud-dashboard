import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('shows the five required backend areas in the sidebar', () => {
    render(<App />)

    expect(screen.getByRole('navigation', { name: '管理後臺導覽' })).toBeInTheDocument()
    for (const label of [
      '使用者與權限',
      '知識代理人管理',
      '稽核日誌',
      '使用統計',
      '回饋管理',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it('lets RD demo the knowledge-agent creation flow', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /知識代理人管理/ }))
    await user.type(
      screen.getByPlaceholderText('輸入代理人名稱，例如：採購規範助手'),
      '採購規範助手',
    )
    await user.click(screen.getByRole('button', { name: '新增代理人' }))

    expect(screen.getAllByText('採購規範助手').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText('System Prompt')).toBeInTheDocument()
  })
})
