import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import { Copy, Check, Terminal } from 'lucide-react';
import type { Components } from 'react-markdown';

// ─── CodeBlock ────────────────────────────────────────────────────────────────

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock = ({ language, value }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden my-6 border border-zinc-800 shadow-2xl bg-[#0d1117] ring-1 ring-white/5 text-left">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <Terminal size={12} className="text-zinc-600 ml-2" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono-custom">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-all py-1 px-2.5 rounded-md hover:bg-zinc-800 border border-transparent hover:border-zinc-700"
          aria-label="Copy code"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        style={atomDark}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1.25rem 1.5rem', fontSize: '0.8rem', lineHeight: '1.7', backgroundColor: '#0d1117' }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

// ─── Markdown components map ──────────────────────────────────────────────────

const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className ?? '');
    const value = String(children).replace(/\n$/, '');

    if (match) {
      return <CodeBlock language={match[1]} value={value} />;
    }
    return (
      <code
        className={`${className ?? ''} bg-zinc-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-sm border border-zinc-800`}
        {...props}
      >
        {children}
      </code>
    );
  },
};

// ─── MarkdownRenderer ─────────────────────────────────────────────────────────

export const MarkdownRenderer = ({ content }: { content: string }) => (
  <div className="prose prose-zinc prose-invert max-w-none text-left
    prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-headings:tracking-tight
    prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
    prose-h3:text-xl prose-h3:mt-7 prose-h3:mb-3
    prose-p:text-zinc-400 prose-p:leading-7 prose-p:text-base
    prose-strong:text-zinc-100
    prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
    prose-code:text-indigo-300 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5
    prose-code:rounded prose-code:text-sm prose-code:border prose-code:border-zinc-800 prose-code:font-normal
    prose-img:rounded-xl prose-img:border prose-img:border-zinc-800
    prose-blockquote:border-l-indigo-500 prose-blockquote:text-zinc-400
    prose-hr:border-zinc-800 prose-li:text-zinc-400">
    <ReactMarkdown rehypePlugins={[rehypeSlug]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  </div>
);

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Estimates reading time from raw markdown content (~200 wpm). */
export const readingTime = (content: string): string => {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
};
