import api from './axios';
import type { Post, PostFormData, PaginatedResponse } from '../types';

export const postsApi = {
  getPublished: (page = 1, limit = 10): Promise<PaginatedResponse<Post>> =>
    api.get<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`).then(r => r.data),

  getAll: (page = 1, limit = 10): Promise<PaginatedResponse<Post>> =>
    api.get<PaginatedResponse<Post>>(`/posts/admin?page=${page}&limit=${limit}`).then(r => r.data),

  getById: (id: string): Promise<Post> =>
    api.get<Post>(`/posts/admin/${id}`).then(r => r.data),

  getBySlug: (slug: string): Promise<Post> =>
    api.get<Post>(`/posts/${slug}`).then(r => r.data),

  create: (data: PostFormData): Promise<Post> =>
    api.post<Post>('/posts', data).then(r => r.data),

  update: (id: string, data: Partial<PostFormData>): Promise<Post> =>
    api.patch<Post>(`/posts/${id}`, data).then(r => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/posts/${id}`).then(() => undefined),
};

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  },
};

export const authApi = {
  login: (username: string, password: string): Promise<{ access_token: string }> =>
    api.post<{ access_token: string }>('/auth/login', { username, password }).then(r => r.data),
};
