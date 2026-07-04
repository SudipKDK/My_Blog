import '@testing-library/jest-dom';

// Provide a writable clipboard stub for all tests (jsdom doesn't implement it)
Object.defineProperty(navigator, 'clipboard', {
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});
