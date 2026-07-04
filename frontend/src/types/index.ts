// Shared domain types for the Blog application

export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  published: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
