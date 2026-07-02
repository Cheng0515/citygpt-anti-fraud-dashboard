import { describe, expect, it } from 'vitest'

import { inferTask } from './inferTask'

describe('inferTask', () => {
  it('creates a human-readable three-step Yunlin news workflow', () => {
    const task = inferTask('搜尋雲林相關新聞明天發送')

    expect(task.steps.map((step) => step.title)).toEqual([
      '搜尋資料',
      'AI 整理內容',
      '寄送 Email',
    ])
    expect(task.steps[1].inputLabel).toBe('Step 1 搜尋結果')
    expect(task.steps[2].fields.bodySource).toBe('AI 摘要結果')
    expect(task.schedule.time).toBe('08:30')
  })
})
