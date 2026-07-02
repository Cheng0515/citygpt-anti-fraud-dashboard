import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import App from './App'

const openBuilder = async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /建立新任務/ }))
  return user
}

describe('AI scheduler prototype', () => {
  beforeEach(() => localStorage.clear())

  it('opens the full-page builder and generates a human-readable three-step flow', async () => {
    const user = await openBuilder()

    expect(screen.getByRole('heading', { name: '建立 AI 任務' })).toBeInTheDocument()
    expect(screen.getByText('描述任務')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }))

    expect(screen.getByText('已為你建立 3 個步驟')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /搜尋資料/ })).toBeInTheDocument()
    expect(screen.getByText('自動使用：Step 1 搜尋結果')).toBeInTheDocument()
    expect(screen.queryByText(/step_1_output/i)).not.toBeInTheDocument()
  })

  it('requires explicit approval before applying an optimized rule', async () => {
    const user = await openBuilder()
    await user.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }))
    const original = screen.getByLabelText('整理規則') as HTMLTextAreaElement
    const originalValue = original.value

    await user.click(screen.getByRole('button', { name: '幫我優化整理規則' }))
    expect(screen.getByText('AI 建議版本')).toBeInTheDocument()
    expect(original).toHaveValue(originalValue)
    await user.click(screen.getByRole('button', { name: '套用建議' }))
    expect(original).not.toHaveValue(originalValue)
  })

  it('blocks save without a recipient and focuses the field', async () => {
    const user = await openBuilder()
    await user.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }))
    await user.click(screen.getByRole('button', { name: '儲存任務' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      '請先填寫收件人，才能建立寄送 Email 任務。',
    )
    expect(screen.getByLabelText('收件人')).toHaveFocus()
  })

  it('previews an email in mobile mode and returns to the list after a valid save', async () => {
    const user = await openBuilder()
    await user.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }))
    await user.type(screen.getByLabelText('收件人'), 'manager@example.com')
    await user.click(screen.getByRole('button', { name: '預覽 Email' }))
    const dialog = screen.getByRole('dialog', { name: 'Email 預覽' })
    await user.click(within(dialog).getByRole('button', { name: '手機' }))
    expect(within(dialog).getByTestId('email-preview')).toHaveClass('mobile')
    await user.click(within(dialog).getByRole('button', { name: '關閉' }))
    await user.click(screen.getByRole('button', { name: '儲存任務' }))

    expect(screen.getByRole('heading', { name: 'AI 任務排程' })).toBeInTheDocument()
    expect(screen.getByText('搜尋雲林相關新聞並寄出摘要')).toBeInTheDocument()
  })

  it('filters tasks and requires named confirmation before deletion', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(screen.getByLabelText('狀態篩選'), 'error')
    expect(screen.getByText('每日競品動態摘要')).toBeInTheDocument()
    expect(screen.queryByText('每週產業新聞快報')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '刪除 每日競品動態摘要' }))
    const dialog = screen.getByRole('dialog', { name: '確認刪除任務' })
    expect(dialog).toHaveTextContent('每日競品動態摘要')
    expect(dialog).toHaveTextContent('刪除後將無法執行後續排程')
    await user.click(within(dialog).getByRole('button', { name: '確認刪除' }))
    expect(screen.queryByText('每日競品動態摘要')).not.toBeInTheDocument()
  })

  it('runs a local test timeline without saving the task', async () => {
    const user = await openBuilder()
    await user.click(screen.getByRole('button', { name: 'AI 幫我建立流程' }))
    await user.click(screen.getByRole('button', { name: '測試執行' }))
    expect(screen.getByRole('dialog', { name: '測試執行' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByText('完成')).toHaveLength(3), {
      timeout: 2000,
    })
    await user.click(screen.getByRole('button', { name: '完成測試' }))
    expect(screen.getByRole('heading', { name: '建立 AI 任務' })).toBeInTheDocument()
  })

  it('offers to restore a locally saved draft', async () => {
    localStorage.setItem(
      'ai-scheduler-draft',
      JSON.stringify({ description: '追蹤農業新聞每天寄送', recipient: 'news@example.com' }),
    )
    await openBuilder()
    expect(screen.getByRole('dialog', { name: '找到未完成草稿' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '恢復草稿' }))
    expect(screen.getByLabelText('描述你想自動完成的任務')).toHaveValue(
      '追蹤農業新聞每天寄送',
    )
  })
})
