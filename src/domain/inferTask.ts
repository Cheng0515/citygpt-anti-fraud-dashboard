import type { SchedulerTask } from './scheduler'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function inferTask(description: string): SchedulerTask {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    id: 'draft-task',
    title: '搜尋雲林相關新聞並寄出摘要',
    description,
    intent: [
      { label: '主題', value: '雲林最新新聞', source: 'user' },
      { label: '閱讀對象', value: '主管', source: 'ai' },
      { label: '輸出格式', value: '正式重點摘要', source: 'ai' },
      { label: '寄送方式', value: 'Email', source: 'user' },
    ],
    steps: [
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
            '每則新聞需包含標題、來源、摘要、影響與後續關注；不得猜測或補造資訊。',
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
    ],
    schedule: {
      frequency: 'once',
      date: formatLocalDate(tomorrow),
      time: '08:30',
      enabled: true,
      inferredTime: true,
    },
    status: 'draft',
    updatedAt: new Date().toISOString(),
  }
}
