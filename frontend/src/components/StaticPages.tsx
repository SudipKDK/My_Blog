import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Tag, Archive, Info, Terminal, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSidebar } from './Layout';

// ─── Shared: clear sidebar on mount ──────────────────────────────────────────

const useClearSidebar = () => {
  const { setRightSidebar } = useSidebar();
  useEffect(() => { setRightSidebar(null); }, [setRightSidebar]);
};

// ─── Shared: Page Header ─────────────────────────────────────────────────────

interface PageHeaderProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

const PageHeader = ({ icon: Icon, eyebrow, title, subtitle }: PageHeaderProps) => (
  <header className="mb-12">
    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4">
      <Icon size={11} /><span>{eyebrow}</span>
    </div>
    <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">{title}</h1>
    {subtitle && <p className="text-zinc-500 text-sm">{subtitle}</p>}
  </header>
);

// ─── Categories ───────────────────────────────────────────────────────────────

interface Category {
  name: string;
  icon: LucideIcon;
  desc: string;
  gradient: string;
  hover: string;
}

const CATEGORIES: Category[] = [
  { name: 'Infrastructure', icon: Terminal,  desc: 'Servers, networking, and bare-metal ops',   gradient: 'from-blue-600/20 to-blue-600/5',    hover: 'hover:border-blue-500/30' },
  { name: 'Security',       icon: Info,      desc: 'Hardening, CVEs, and zero-trust patterns',  gradient: 'from-rose-600/20 to-rose-600/5',    hover: 'hover:border-rose-500/30' },
  { name: 'Automation',     icon: Layers,    desc: 'CI/CD pipelines and GitOps workflows',      gradient: 'from-amber-600/20 to-amber-600/5',  hover: 'hover:border-amber-500/30' },
  { name: 'Cloud Native',   icon: Archive,   desc: 'Kubernetes, Helm, and service mesh',        gradient: 'from-emerald-600/20 to-emerald-600/5', hover: 'hover:border-emerald-500/30' },
];

export const Categories = () => {
  useClearSidebar();
  return (
    <div className="text-left animate-fade-in w-full">
      <PageHeader icon={Layers} eyebrow="Browse" title="Categories" subtitle="Explore posts organized by technical domain." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
        {CATEGORIES.map(cat => (
          <div key={cat.name} className={`p-7 rounded-2xl bg-gradient-to-br ${cat.gradient} border border-zinc-800 ${cat.hover} transition-all duration-300 group cursor-pointer`}>
            <div className="flex items-start justify-between mb-4">
              <cat.icon size={22} className="text-zinc-500 group-hover:text-white transition-colors" />
              <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h2 className="text-lg font-black text-zinc-300 group-hover:text-white transition-colors mb-1.5">{cat.name}</h2>
            <p className="text-zinc-600 text-xs leading-relaxed">{cat.desc}</p>
            <p className="text-[10px] text-zinc-700 font-semibold uppercase tracking-widest mt-4">0 posts</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

interface TagItem {
  name: string;
  size: string;
}

const TAGS: TagItem[] = [
  { name: 'Kubernetes',  size: 'text-base' },
  { name: 'Terraform',   size: 'text-sm'   },
  { name: 'AWS',         size: 'text-lg'   },
  { name: 'Docker',      size: 'text-base' },
  { name: 'CI/CD',       size: 'text-sm'   },
  { name: 'Python',      size: 'text-base' },
  { name: 'Go',          size: 'text-2xl'  },
  { name: 'Rust',        size: 'text-sm'   },
  { name: 'Linux',       size: 'text-lg'   },
  { name: 'NixOS',       size: 'text-xs'   },
  { name: 'Ansible',     size: 'text-sm'   },
  { name: 'Prometheus',  size: 'text-xs'   },
];

export const Tags = () => {
  useClearSidebar();
  return (
    <div className="text-left animate-fade-in w-full">
      <PageHeader icon={Tag} eyebrow="Tags" title="Tag Cloud" subtitle="Discover posts by keyword and technology." />
      <div className="flex flex-wrap gap-3">
        {TAGS.map(tag => (
          <span
            key={tag.name}
            className={`${tag.size} px-5 py-2.5 bg-zinc-900/60 rounded-xl font-bold text-zinc-500 uppercase tracking-wide border border-zinc-800 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-500/5 cursor-pointer transition-all duration-200`}
          >
            #{tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Archives ─────────────────────────────────────────────────────────────────

const ARCHIVE_YEARS = [2026, 2025, 2024] as const;

export const Archives = () => {
  useClearSidebar();
  return (
    <div className="text-left animate-fade-in w-full">
      <PageHeader icon={Archive} eyebrow="Archives" title="Deployment History" subtitle="A chronological log of all published posts." />
      <div className="relative border-l border-zinc-800 pl-10 ml-3 space-y-12">
        {ARCHIVE_YEARS.map((year, i) => (
          <div key={year} className="relative animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
            <h2 className="text-3xl font-black text-white tracking-tight mb-4">{year}</h2>
            <p className="text-zinc-700 text-xs font-semibold uppercase tracking-widest">
              {year === 2026 ? 'Posts will appear here' : 'No posts for this year'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── About ────────────────────────────────────────────────────────────────────

const TECH_STACK = ['Kubernetes', 'Terraform', 'AWS', 'Linux', 'Rust', 'Go', 'Python', 'Docker'] as const;

export const About = () => {
  useClearSidebar();
  return (
    <div className="text-left animate-fade-in max-w-2xl w-full">
      <PageHeader icon={Info} eyebrow="About" title="System Manifest" />
      <div className="space-y-6 text-zinc-400 text-base leading-relaxed mb-12">
        <p>
          I'm <span className="text-white font-bold">Sudip</span>, an infrastructure architect focused on building
          high-velocity delivery systems and self-healing cloud environments.
        </p>
        <p>
          This blog is a technical registry — a secure vault for blueprints, post-mortems, and engineering
          philosophies developed during years of cloud-native operations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Core Stack</h3>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 bg-zinc-800/60 rounded-lg text-zinc-400 font-medium border border-zinc-700/40">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Network Status</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold text-emerald-400">Always Operational</span>
          </div>
          <p className="text-xs text-zinc-600 font-medium">99.9% uptime SLA</p>
          <div className="mt-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              View Posts <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 404 ──────────────────────────────────────────────────────────────────────

export const NotFound = () => {
  useClearSidebar();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in">
      <p className="text-8xl font-black text-zinc-800 mb-4 tracking-tighter">404</p>
      <h1 className="text-2xl font-black text-white mb-3">Page Not Found</h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
};
