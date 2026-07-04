import { describe, it, expect } from 'vitest';
import { readingTime } from '../../components/CodeBlock';

describe('readingTime', () => {
  it('returns "1 min read" for very short content', () => {
    expect(readingTime('Hello world')).toBe('1 min read');
  });

  it('returns "1 min read" for an empty string', () => {
    expect(readingTime('')).toBe('1 min read');
  });

  it('calculates correct reading time for longer content (~200 words = 1 min)', () => {
    const words = Array(200).fill('word').join(' ');
    expect(readingTime(words)).toBe('1 min read');
  });

  it('calculates correct reading time for ~400 words (2 min)', () => {
    const words = Array(400).fill('word').join(' ');
    expect(readingTime(words)).toBe('2 min read');
  });

  it('rounds up to 1 min minimum even for single-word content', () => {
    expect(readingTime('SingleWord')).toBe('1 min read');
  });
});
