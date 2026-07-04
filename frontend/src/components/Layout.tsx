import { useState, useEffect, createContext, useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, Layers, Tag, Archive, Info,
  Terminal, Mail, Rss, Menu, X, LayoutDashboard, PlusCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// ─── Sidebar Context ──────────────────────────────────────────────────────────

interface SidebarContextValue {
  setRightSidebar: (el: React.ReactNode) => void;
}

const SidebarContext = createContext<SidebarContextValue>({ setRightSidebar: () => {} });

export const useSidebar = () => useContext(SidebarContext);

// ─── TOC Hook ─────────────────────────────────────────────────────────────────

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const useTOC = (contentRef: React.RefObject<HTMLElement | null>) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const headings = Array.from(el.querySelectorAll('h2, h3'));
    const items = headings.map(h => ({
      id: h.id,
      text: (h as HTMLElement).innerText,
      level: parseInt(h.tagName[1]),
    }));
    setToc(items);

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: '-10% 0% -75% 0%' },
    );
    headings.forEach(h => observer.observe(h));
    return () => observer.disconnect();
  // content ref is stable; re-run when toc length changes (content has loaded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toc.length]);

  return { toc, activeId };
};

// ─── TableOfContents ──────────────────────────────────────────────────────────

export const TableOfContents = ({ contentRef }: { contentRef: React.RefObject<HTMLElement | null> }) => {
  const { toc, activeId } = useTOC(contentRef);
  if (toc.length === 0) return null;

  return (
    <div className="sticky top-0 py-14 px-8 text-left h-screen overflow-y-auto sidebar-scroll">
      <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.35em] mb-6 flex items-center gap-2">
        <span className="w-4 h-px bg-zinc-700" />On This Page
      </h3>
      <nav className="space-y-1">
        {toc.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={[
              'block text-[11px] font-medium transition-all duration-200 leading-5 py-0.5 border-l-2 pl-3',
              item.level === 3 ? 'ml-3 text-[10px]' : '',
              activeId === item.id
                ? 'text-indigo-400 border-indigo-500'
                : 'text-zinc-600 border-transparent hover:text-zinc-300 hover:border-zinc-600',
            ].join(' ')}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

// ─── Nav Links (shared) ───────────────────────────────────────────────────────

const NAV_LINKS = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/categories', label: 'Categories', icon: Layers },
  { to: '/tags', label: 'Tags', icon: Tag },
  { to: '/archives', label: 'Archives', icon: Archive },
  { to: '/about', label: 'About', icon: Info },
] as const;

const SOCIAL_ICONS = [Terminal, Layers, Mail, Rss] as const;

// ─── LeftSidebar ─────────────────────────────────────────────────────────────

export const LeftSidebar = () => (
  <aside className="hidden lg:flex flex-col sticky top-0 h-screen py-10 px-6 border-r border-zinc-900 bg-zinc-950">
    <div className="mb-10 text-left">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 mb-5 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20">
        S
      </div>
      <h2 className="text-base font-black text-white tracking-tight mb-0.5">
        Sudip<span className="text-indigo-400">_Node</span>
      </h2>
      <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-widest">Infrastructure Architect</p>
    </div>

    <nav className="flex-grow space-y-1">
      {NAV_LINKS.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-semibold tracking-wide ${
              isActive
                ? 'text-white bg-indigo-600/15 border border-indigo-500/20 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
            }`
          }
        >
          <link.icon size={15} />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="flex items-center gap-2 pt-6 border-t border-zinc-900">
      {SOCIAL_ICONS.map((Icon, i) => (
        <button
          key={i}
          aria-label="Social link"
          className="w-8 h-8 rounded-lg bg-zinc-900/80 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all border border-zinc-800/50"
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  </aside>
);

// ─── MobileNavbar ─────────────────────────────────────────────────────────────

export const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <nav className="lg:hidden bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-50 px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow shadow-indigo-500/30">
            <Terminal size={15} className="text-white" />
          </div>
          <span className="text-base font-black text-white tracking-tight">
            Sudip<span className="text-indigo-400">_Node</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-label="Toggle navigation"
          className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen && (
        <div className="fixed inset-0 top-16 bg-zinc-950/98 backdrop-blur-xl z-40 px-8 py-10 flex flex-col slide-in-right lg:hidden">
          <div className="space-y-2 flex-grow">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={close}
                className="flex items-center gap-5 py-4 px-4 text-lg font-bold text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <link.icon size={22} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="pt-8 border-t border-zinc-900 flex gap-5">
            {SOCIAL_ICONS.map((Icon, i) => <Icon key={i} size={22} className="text-zinc-600" />)}
          </div>
        </div>
      )}
    </>
  );
};

// ─── Public Layout ────────────────────────────────────────────────────────────

export const PublicLayout = () => {
  const [rightSidebar, setRightSidebar] = useState<React.ReactNode>(null);

  return (
    <SidebarContext.Provider value={{ setRightSidebar }}>
      <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans relative w-full">
        <div className="fixed top-0 left-1/4 w-1/2 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none glow-pulse" />
        <MobileNavbar />
        <div className="w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-2 xl:col-span-2"><LeftSidebar /></div>
          <main className="col-span-1 lg:col-span-7 xl:col-span-7 min-h-screen py-10 lg:py-14 px-6 lg:px-12 xl:px-16 border-r border-zinc-900">
            <Outlet />
          </main>
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 min-h-screen">{rightSidebar}</div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

// ─── Admin Layout ─────────────────────────────────────────────────────────────

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const NavLinks = () => (
    <>
      <nav className="space-y-1 flex-grow">
        <NavLink to="/admin" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${isActive ? 'bg-white text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
          <LayoutDashboard size={16} /><span>Registry</span>
        </NavLink>
        <NavLink to="/admin/create" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold text-sm ${isActive ? 'bg-white text-black' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
          <PlusCircle size={16} /><span>New Post</span>
        </NavLink>
      </nav>
      <div className="border-t border-zinc-900 pt-5 mt-5">
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-600 hover:text-zinc-300 font-semibold text-sm transition-colors">
          <HomeIcon size={16} /><span>Back to Site</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-300 font-sans w-full relative">
      <aside className="w-64 bg-black border-r border-zinc-900 p-6 hidden lg:flex flex-col text-left h-screen sticky top-0">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={15} className="text-white" />
          </div>
          <span className="text-base font-black text-white tracking-tight">
            Admin<span className="text-indigo-400">X</span>
          </span>
        </div>
        <NavLinks />
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Desktop Header */}
        <header className="bg-black border-b border-zinc-900 h-14 hidden lg:flex items-center px-8 justify-between flex-shrink-0">
          <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Console_Active</span>
          <button
            onClick={handleLogout}
            className="text-[11px] font-semibold text-zinc-500 hover:text-rose-400 transition-colors uppercase tracking-widest border border-zinc-900 hover:border-rose-500/30 px-4 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </header>

        {/* Mobile Header */}
        <header className="bg-black border-b border-zinc-900 h-16 flex lg:hidden items-center px-5 justify-between flex-shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded flex items-center justify-center">
              <LayoutDashboard size={13} className="text-white" />
            </div>
            <span className="text-sm font-black text-white tracking-tight">
              Admin<span className="text-indigo-400">X</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold text-rose-500 transition-colors uppercase tracking-widest"
            >
              Exit
            </button>
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-zinc-950/98 backdrop-blur-xl z-40 px-6 py-8 flex flex-col slide-in-right lg:hidden text-left">
            <NavLinks />
          </div>
        )}

        <main className="flex-grow p-5 sm:p-8 lg:p-12 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
};
