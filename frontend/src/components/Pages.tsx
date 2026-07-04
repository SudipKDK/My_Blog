import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronRight, ArrowLeft, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { postsApi } from '../api/posts';
import type { Post } from '../types';
import { useSidebar, TableOfContents } from './Layout';
import { MarkdownRenderer, readingTime } from './CodeBlock';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const PostSkeleton = () => (
  <div className="space-y-6 border-b border-zinc-900 pb-14">
    <div className="aspect-[21/9] rounded-2xl skeleton" />
    <div className="h-3 w-32 rounded skeleton" />
    <div className="h-8 w-3/4 rounded-lg skeleton" />
    <div className="h-4 w-full rounded skeleton" />
    <div className="h-4 w-5/6 rounded skeleton" />
    <div className="h-10 w-36 rounded-xl skeleton" />
  </div>
);

// ─── Home ─────────────────────────────────────────────────────────────────────

export const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setRightSidebar } = useSidebar();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setRightSidebar(
      <div className="py-14 px-8 text-left">
        <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.35em] mb-5 flex items-center gap-2">
          <span className="w-4 h-px bg-zinc-700" /> Current Activities
        </h3>
        <div className="space-y-3">
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-600/50 flex-shrink-0" />
              <div className="h-1.5 bg-zinc-800 rounded-full" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-10 p-5 bg-zinc-900/40 rounded-xl border border-zinc-800/50">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-1">Status</p>
          <p className="text-xs font-bold text-emerald-400">● Online — 99.9% uptime</p>
        </div>
      </div>,
    );

    setLoading(true);
    postsApi.getPublished(page)
      .then(res => {
        setPosts(res.data);
        setTotalPages(Math.ceil(res.total / res.limit));
      })
      .catch(() => setError('Failed to load posts. Is the backend running?'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (loading) return (
    <div className="space-y-14 animate-fade-in">
      <Helmet>
        <title>Sudip_Node | Infrastructure Architect</title>
      </Helmet>

      <div className="mb-16">
        <div className="h-12 w-2/3 rounded-xl skeleton mb-4" />
        <div className="h-4 w-1/2 rounded skeleton" />
      </div>
      {[1, 2].map(i => <PostSkeleton key={i} />)}
    </div>
  );

  return (
    <div className="animate-fade-in text-left w-full">
      <Helmet>
        <title>Engineering Insights | Sudip_Node</title>
      </Helmet>
      <header className="mb-16">
        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight mb-4">
          Engineering<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Insights</span>
        </h1>
        <p className="text-zinc-500 text-sm font-medium max-w-lg leading-relaxed">
          Technical registry for modern infrastructure automation and cloud architecture.
        </p>
      </header>

      {error && (
        <div className="mb-10 p-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          ⚠ {error}
        </div>
      )}

      <div className="stagger space-y-14">
        {posts.map(post => (
          <article key={post._id} className="group border-b border-zinc-900/80 pb-14 last:border-0">
            <Link to={`/post/${post.slug}`}>
              <div className="mb-6 aspect-[21/9] bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-xl transition-all duration-700 group-hover:border-indigo-500/30 relative">
                {post.coverImage
                  ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                  : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                      <span className="text-5xl font-black text-zinc-800 tracking-tighter uppercase italic select-none">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </Link>

            <div className="flex items-center flex-wrap gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={11} className="text-indigo-500" />
                {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-zinc-800">·</span>
              <span className="flex items-center gap-1.5"><Clock size={11} />{readingTime(post.content)}</span>
              <span className="text-zinc-800">·</span>
              <span className={post.published ? 'text-emerald-500' : 'text-amber-500'}>
                {post.published ? '● Published' : '○ Draft'}
              </span>
            </div>

            <Link to={`/post/${post.slug}`}>
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-4 group-hover:text-indigo-300 transition-colors leading-tight">
                {post.title}
              </h2>
            </Link>
            <p className="text-zinc-500 text-base leading-relaxed mb-6 line-clamp-3 max-w-2xl">
              {post.content.replace(/[#*`]/g, '').substring(0, 200)}…
            </p>
            <Link
              to={`/post/${post.slug}`}
              className="inline-flex items-center gap-2.5 text-xs font-bold text-zinc-300 uppercase tracking-widest hover:text-white transition-all border border-zinc-800 px-5 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-indigo-600 hover:border-indigo-500 shadow-lg group/btn"
            >
              <span>Read Post</span>
              <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </article>
        ))}

        {!error && posts.length === 0 && (
          <div className="py-32 text-center text-zinc-700 font-bold uppercase tracking-widest border border-dashed border-zinc-900 rounded-2xl text-sm">
            No posts yet — create your first one in the admin panel.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-14 border-t border-zinc-900 pt-8">
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <span className="text-xs font-medium text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── PostDetail ───────────────────────────────────────────────────────────────

export const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const { setRightSidebar } = useSidebar();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    postsApi.getBySlug(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (post) setRightSidebar(<TableOfContents contentRef={articleRef} />);
    return () => setRightSidebar(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  if (loading) return (
    <div className="animate-pulse space-y-8 text-left">
      <div className="h-5 w-28 rounded skeleton" />
      <div className="h-12 w-5/6 rounded-xl skeleton" />
      <div className="aspect-video rounded-2xl skeleton" />
      {[100, 90, 80, 70, 95].map((w, i) => (
        <div key={i} className="h-4 rounded skeleton" style={{ width: `${w}%` }} />
      ))}
    </div>
  );

  if (error || !post) return (
    <div className="py-40 text-center animate-fade-in">
      <p className="text-6xl font-black text-zinc-800 mb-4">404</p>
      <p className="text-zinc-600 font-medium mb-8">Post not found or was removed.</p>
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
        <ArrowLeft size={16} />Return Home
      </Link>
    </div>
  );

  return (
    <article ref={articleRef} className="animate-fade-in text-left text-zinc-300 w-full">
      <Helmet>
        <title>{post.title} | Sudip_Node</title>
      </Helmet>
      <header className="mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-white transition-colors font-semibold text-xs uppercase tracking-widest mb-10 group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Registry
        </Link>

        <div className="flex items-center gap-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-5">
          <Calendar size={11} />
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="text-zinc-800">·</span>
          <Clock size={11} className="text-zinc-500" />
          <span className="text-zinc-500">{readingTime(post.content)}</span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-8">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl aspect-video">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      <MarkdownRenderer content={post.content} />
    </article>
  );
};
