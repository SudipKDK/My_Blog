// src/test/utils/math.test.ts
import { describe, it, expect } from 'vitest'
import { add, divide } from '../../utils/math'

describe('add', () => {
  it('adds two positive numbers', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(add(-2, 5)).toBe(3)
  })
})

describe('divide', () => {
  it('divides two numbers correctly', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('throws an error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
  })
})
