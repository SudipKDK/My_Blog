import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AuthProvider } from './hooks/useAuth';

// Layouts
import { PublicLayout, AdminLayout } from './components/Layout';

// Public Pages
import { Home, PostDetail } from './components/Pages';
import { Categories, Tags, Archives, About, NotFound } from './components/StaticPages';

// Admin Pages
import { AdminLogin, AdminDashboard, CreatePost, EditPost } from './components/AdminPages';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' } }} />
      <BrowserRouter>
        <Routes>
          {/* Public Site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/about" element={<About />} />
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Login (standalone, no layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="edit/:id" element={<EditPost />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
