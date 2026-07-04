// src/test/components/CodeBlock.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CodeBlock } from '../../components/CodeBlock';

// navigator.clipboard is stubbed globally in src/test/setup.ts
// We spy on writeText per test so we can track calls
let writeTextSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  writeTextSpy = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);
});

describe('CodeBlock', () => {
  const defaultProps = {
    language: 'typescript',
    value: 'const hello = "world";',
  };

  it('renders the code value', () => {
    const { container } = render(<CodeBlock {...defaultProps} />);
    // SyntaxHighlighter splits code into span tokens; check container text
    const codeEl = container.querySelector('code');
    expect(codeEl).not.toBeNull();
    expect(codeEl!.textContent).toContain('hello');
  });

  it('displays the language label', () => {
    render(<CodeBlock {...defaultProps} />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('shows a Copy button initially', () => {
    render(<CodeBlock {...defaultProps} />);
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('changes to "Copied!" text after clicking the copy button', async () => {
    const user = userEvent.setup();
    render(<CodeBlock {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /copy code/i }));
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('calls clipboard.writeText with the correct value on copy', async () => {
    const user = userEvent.setup();
    render(<CodeBlock {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /copy code/i }));
    expect(writeTextSpy).toHaveBeenCalledWith(defaultProps.value);
  });
});
