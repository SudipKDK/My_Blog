import { useState } from 'react'

interface CounterProps {
  initialCount?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onCountChange?: (count: number) => void
}

export function Counter({
  initialCount = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  onCountChange,
}: CounterProps) {
  const [count, setCount] = useState(initialCount)

  const update = (next: number) => {
    setCount(next)
    onCountChange?.(next)
  }

  const increment = () => update(Math.min(max, count + step))
  const decrement = () => update(Math.max(min, count - step))
  const reset = () => update(initialCount)

  return (
    <div>
      <p aria-live="polite" aria-atomic="true">Count: {count}</p>
      <button onClick={decrement} disabled={disabled || count <= min}>
        Decrement
      </button>
      <button onClick={increment} disabled={disabled || count >= max}>
        Increment
      </button>
      <button onClick={reset} disabled={disabled}>
        Reset
      </button>
    </div>
  )
}
