import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { inferTask } from './inferTask'

describe('inferTask', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 2, 23, 30, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates the complete Yunlin news workflow contract', () => {
    const task = inferTask('搜尋雲林相關新聞明天發送')

    expect(task).toMatchObject({
      id: 'draft-task',
      title: '搜尋雲林相關新聞並寄出摘要',
      description: '搜尋雲林相關新聞明天發送',
      status: 'draft',
    })
    expect(task.intent).toEqual([
      { label: '主題', value: '雲林最新新聞', source: 'user' },
      { label: '閱讀對象', value: '主管', source: 'ai' },
      { label: '輸出格式', value: '正式重點摘要', source: 'ai' },
      { label: '寄送方式', value: 'Email', source: 'user' },
    ])
    expect(task.steps).toEqual([
      {
        id: 'step_1',
        kind: 'search',
        title: '搜尋資料',
        outputKey: 'step_1_output',
        outputLabel: '搜尋結果',
        fields: {
          query: '雲林最新新聞、雲林縣政府、雲林地方新聞',
          scope: '最新網路新聞與官方網站',
        },
      },
      {
        id: 'step_2',
        kind: 'ai',
        title: 'AI 整理內容',
        inputFrom: ['step_1_output'],
        inputLabel: 'Step 1 搜尋結果',
        outputKey: 'step_2_output',
        outputLabel: 'AI 摘要結果',
        fields: {
          rules:
            '整理新聞標題、來源、重點摘要、影響層面與建議追蹤事項；資料不足時明確標示，不自行推測。',
        },
      },
      {
        id: 'step_3',
        kind: 'email',
        title: '寄送 Email',
        inputFrom: ['step_2_output'],
        inputLabel: 'Step 2 AI 摘要結果',
        fields: {
          recipient: '',
          subject: '每日雲林新聞摘要',
          bodySource: 'AI 摘要結果',
          intro: '請參考以下今日雲林新聞摘要。',
          outro: '以上提供參考，謝謝。',
        },
      },
    ])
    expect(task.schedule).toMatchObject({
      frequency: 'once',
      time: '08:30',
      enabled: true,
      inferredTime: true,
    })
  })

  it('schedules tomorrow by the local calendar at a day boundary', () => {
    const task = inferTask('搜尋雲林相關新聞明天發送')

    expect(task.schedule.date).toBe('2026-07-03')
  })

  it('records updatedAt as a valid ISO timestamp', () => {
    const task = inferTask('搜尋雲林相關新聞明天發送')

    expect(task.updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    )
    expect(new Date(task.updatedAt).toISOString()).toBe(task.updatedAt)
  })
})
