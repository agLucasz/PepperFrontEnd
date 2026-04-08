const configuredApiBaseUrl =
  import.meta.env.REACT_APP_API_URL ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:5000';

function normalizeApiBaseUrl(rawBaseUrl: string): string {
  const value = rawBaseUrl.trim().replace(/\/+$/, '');
  if (!value) return 'http://localhost:5000';

  // If app is served via HTTP, force API to HTTP to avoid mixed protocol failures.
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'http:' &&
    value.startsWith('https://')
  ) {
    return value.replace(/^https:\/\//, 'http://');
  }

  return value;
}

export const API_BASE_URL = normalizeApiBaseUrl(configuredApiBaseUrl);

export const PRODUTO_HUB_URL = `${API_BASE_URL}/produtoHub`;

export function resolveImageUrl(rawUrl: string): string {
  const value = rawUrl.trim();
  if (!value) return '';

  // Keep fully-qualified URLs unchanged.
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Normalize relative image paths from legacy/new records.
  const normalizedPath = value.startsWith('/uploads/')
    ? value
    : value.startsWith('uploads/')
      ? `/${value}`
      : value.startsWith('/')
        ? value
        : `/uploads/${value}`;

  return `${API_BASE_URL}${normalizedPath}`;
}
