import { expect, it } from 'vitest'

import { inferTask } from './inferTask'
import { validateTask } from './validation'

function taskWithRecipient() {
  const task = inferTask('搜尋雲林新聞明天發送')
  task.steps[2].fields.recipient = 'manager@example.com'

  return task
}

it('requires an email recipient before save', () => {
  expect(validateTask(inferTask('搜尋雲林新聞明天發送'))).toEqual([
    {
      field: 'recipient',
      message: '請先填寫收件人，才能建立寄送 Email 任務。',
    },
  ])
})

it('accepts a complete connected task', () => {
  expect(validateTask(taskWithRecipient())).toEqual([])
})

it('reports a missing date before later schedule or source issues', () => {
  const task = taskWithRecipient()
  task.schedule.date = ''
  task.schedule.time = ''
  task.steps[1].inputFrom = []

  expect(validateTask(task)).toEqual([
    { field: 'date', message: '請先設定執行日期。' },
  ])
})

it('reports a missing time before a source issue', () => {
  const task = taskWithRecipient()
  task.schedule.time = ''
  task.steps[1].inputFrom = []

  expect(validateTask(task)).toEqual([
    { field: 'time', message: '請先設定執行時間。' },
  ])
})

it('reports a connected workflow step without an input source', () => {
  const task = taskWithRecipient()
  task.steps[1].inputFrom = []

  expect(validateTask(task)).toEqual([
    { field: 'source', message: '工作流程仍有步驟缺少資料來源。' },
  ])
})
