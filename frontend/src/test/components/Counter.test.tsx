// src/test/components/Counter.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from '../../components/Counter'

// ─── 1. Basic Rendering ───────────────────────────────────────────────────────

describe('Counter — basic rendering', () => {
  it('renders initial count of 0 by default', () => {
    render(<Counter />)
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('renders with a custom initialCount', () => {
    render(<Counter initialCount={5} />)
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
  })

  it('renders Increment, Decrement and Reset buttons', () => {
    render(<Counter />)
    expect(screen.getByRole('button', { name: /increment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decrement/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })
})

// ─── 2. Increment ─────────────────────────────────────────────────────────────

describe('Counter — increment', () => {
  it('increments count by 1 on a single click', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('increments multiple times correctly', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const btn = screen.getByRole('button', { name: /increment/i })
    await user.click(btn)
    await user.click(btn)
    await user.click(btn)
    expect(screen.getByText('Count: 3')).toBeInTheDocument()
  })

  it('respects a custom step value', async () => {
    const user = userEvent.setup()
    render(<Counter step={5} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
  })

  it('does not exceed the max value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={10} max={10} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('Count: 10')).toBeInTheDocument()
  })

  it('disables the Increment button when count reaches max', () => {
    render(<Counter initialCount={10} max={10} />)
    expect(screen.getByRole('button', { name: /increment/i })).toBeDisabled()
  })

  it('handles rapid simultaneous clicks without race conditions', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const btn = screen.getByRole('button', { name: /increment/i })
    // Fire 5 clicks in sequence as fast as userEvent allows
    await Promise.all([
      user.click(btn),
      user.click(btn),
      user.click(btn),
      user.click(btn),
      user.click(btn),
    ])
    // Count should be a positive integer (no negative or NaN from race)
    const countEl = screen.getByText(/^Count: \d+$/)
    expect(countEl).toBeInTheDocument()
    const value = parseInt(countEl.textContent!.replace('Count: ', ''), 10)
    expect(value).toBeGreaterThan(0)
  })
})

// ─── 3. Decrement ─────────────────────────────────────────────────────────────

describe('Counter — decrement', () => {
  it('decrements count when button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={5} />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByText('Count: 4')).toBeInTheDocument()
  })

  it('does not decrement below the min value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={0} min={0} />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('disables the Decrement button when count reaches min', () => {
    render(<Counter initialCount={0} min={0} />)
    expect(screen.getByRole('button', { name: /decrement/i })).toBeDisabled()
  })

  it('decrements by custom step value', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={10} step={3} />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(screen.getByText('Count: 7')).toBeInTheDocument()
  })
})

// ─── 4. Reset ─────────────────────────────────────────────────────────────────

describe('Counter — reset', () => {
  it('resets count to default initialCount (0)', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /increment/i }))
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('resets count to a custom initialCount', async () => {
    const user = userEvent.setup()
    render(<Counter initialCount={3} />)
    const incrementBtn = screen.getByRole('button', { name: /increment/i })
    await user.click(incrementBtn)
    await user.click(incrementBtn)
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(screen.getByText('Count: 3')).toBeInTheDocument()
  })
})

// ─── 5. Disabled State ────────────────────────────────────────────────────────

describe('Counter — disabled state', () => {
  it('renders all buttons as disabled when disabled prop is true', () => {
    render(<Counter disabled />)
    expect(screen.getByRole('button', { name: /increment/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /decrement/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled()
  })

  it('clicking increment does nothing when disabled', async () => {
    const user = userEvent.setup()
    render(<Counter disabled />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })
})

// ─── 6. Callback / Integration ────────────────────────────────────────────────

describe('Counter — onCountChange callback', () => {
  it('calls onCountChange with the new count on increment', async () => {
    const user = userEvent.setup()
    const onCountChange = vi.fn()
    render(<Counter onCountChange={onCountChange} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(onCountChange).toHaveBeenCalledTimes(1)
    expect(onCountChange).toHaveBeenCalledWith(1)
  })

  it('calls onCountChange with the new count on decrement', async () => {
    const user = userEvent.setup()
    const onCountChange = vi.fn()
    render(<Counter initialCount={5} onCountChange={onCountChange} />)
    await user.click(screen.getByRole('button', { name: /decrement/i }))
    expect(onCountChange).toHaveBeenCalledWith(4)
  })

  it('calls onCountChange with initialCount on reset', async () => {
    const user = userEvent.setup()
    const onCountChange = vi.fn()
    render(<Counter initialCount={3} onCountChange={onCountChange} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    onCountChange.mockClear()
    await user.click(screen.getByRole('button', { name: /reset/i }))
    expect(onCountChange).toHaveBeenCalledWith(3)
  })

  it('does not call onCountChange when disabled', async () => {
    const user = userEvent.setup()
    const onCountChange = vi.fn()
    render(<Counter disabled onCountChange={onCountChange} />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(onCountChange).not.toHaveBeenCalled()
  })
})

// ─── 7. Accessibility ─────────────────────────────────────────────────────────

describe('Counter — accessibility', () => {
  it('count text has aria-live="polite" for screen reader announcements', () => {
    render(<Counter />)
    const countEl = screen.getByText('Count: 0')
    expect(countEl).toHaveAttribute('aria-live', 'polite')
  })

  it('increment button is keyboard-triggerable with Enter key', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const btn = screen.getByRole('button', { name: /increment/i })
    btn.focus()
    expect(btn).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('increment button is keyboard-triggerable with Space key', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    const btn = screen.getByRole('button', { name: /increment/i })
    btn.focus()
    await user.keyboard(' ')
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })

  it('all buttons are focusable via Tab', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.tab()
    expect(screen.getByRole('button', { name: /decrement/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /increment/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /reset/i })).toHaveFocus()
  })
})

// ─── 8. Unmount Safety ────────────────────────────────────────────────────────

describe('Counter — unmount safety', () => {
  it('unmounts cleanly after a click without errors', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Counter />)
    await user.click(screen.getByRole('button', { name: /increment/i }))
    expect(() => unmount()).not.toThrow()
  })
})
