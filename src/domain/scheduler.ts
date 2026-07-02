export type TaskStatus =
  | 'active'
  | 'paused'
  | 'error'
  | 'completed'
  | 'draft'

export interface IntentField {
  label: string
  value: string
  source: 'user' | 'ai'
}

export interface WorkflowStep {
  id: 'step_1' | 'step_2' | 'step_3'
  kind: 'search' | 'ai' | 'email'
  title: string
  inputFrom?: string[]
  inputLabel?: string
  outputKey?: string
  outputLabel?: string
  fields: Record<string, string>
}

export interface Schedule {
  frequency: 'once' | 'daily' | 'weekly'
  date: string
  time: string
  enabled: boolean
  inferredTime: boolean
}

export interface SchedulerTask {
  id: string
  title: string
  description: string
  intent: IntentField[]
  steps: WorkflowStep[]
  schedule: Schedule
  status: TaskStatus
  updatedAt: string
}

export interface TestRunItem {
  id: WorkflowStep['id']
  label: string
  state: 'idle' | 'running' | 'success' | 'error'
  summary: string
}
