import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('shows the scheduler heading and create-task action', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'AI 任務排程' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '建立新任務' }),
    ).toBeInTheDocument()
  })
})
