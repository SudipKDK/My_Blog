import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types';

/**
 * Extracts a user-friendly error message from an Axios error.
 *
 * Handles the various error response shapes returned by the NestJS backend:
 * - ValidationPipe errors (message is an array of strings)
 * - Custom exception filters (message is a string)
 * - Network/timeout errors (no response at all)
 */
export function extractErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  // Network error — no response received from the server
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'Could not reach the server. Please check your connection and try again.';
  }

  const data = error.response.data as ApiErrorResponse | undefined;

  if (!data?.message) {
    return fallback;
  }

  // ValidationPipe returns message as an array of strings
  if (Array.isArray(data.message)) {
    return data.message.join('. ');
  }

  return data.message;
}

/**
 * Returns a status-code-aware error message, using the backend message
 * but falling back to sensible defaults per HTTP status.
 */
export function extractErrorWithStatus(error: unknown, fallbacks?: Partial<Record<number, string>>): string {
  if (!isAxiosError(error) || !error.response) {
    return extractErrorMessage(error);
  }

  const status = error.response.status;
  const backendMessage = extractErrorMessage(error);

  // If the backend gave us a useful message, prefer it
  if (backendMessage && backendMessage !== 'Something went wrong. Please try again.') {
    return backendMessage;
  }

  // Otherwise use status-aware fallbacks
  const defaultFallbacks: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    413: 'The file is too large.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'An internal server error occurred. Please try again later.',
    ...fallbacks,
  };

  return defaultFallbacks[status] ?? 'Something went wrong. Please try again.';
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}
