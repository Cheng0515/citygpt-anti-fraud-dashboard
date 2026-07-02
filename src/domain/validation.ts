import type { SchedulerTask } from './scheduler'

export interface ValidationIssue {
  field: 'recipient' | 'date' | 'time' | 'source'
  message: string
}

export function validateTask(task: SchedulerTask): ValidationIssue[] {
  const email = task.steps.find((step) => step.kind === 'email')

  if (!email?.fields.recipient?.trim()) {
    return [
      {
        field: 'recipient',
        message: '請先填寫收件人，才能建立寄送 Email 任務。',
      },
    ]
  }

  if (!task.schedule.date.trim()) {
    return [{ field: 'date', message: '請先設定執行日期。' }]
  }

  if (!task.schedule.time.trim()) {
    return [{ field: 'time', message: '請先設定執行時間。' }]
  }

  if (task.steps.slice(1).some((step) => !step.inputFrom?.length)) {
    return [
      { field: 'source', message: '工作流程仍有步驟缺少資料來源。' },
    ]
  }

  return []
}
