const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('kitz-token');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('kitz-token');
      window.location.href = '/login';
      throw new ApiError(401, 'Unauthorized');
    }
    if (res.status === 403) {
      throw new ApiError(403, 'Forbidden');
    }
    if (res.status >= 500) {
      throw new ApiError(res.status, 'Server error');
    }
    const text = await res.text().catch(() => 'Unknown error');
    const sanitized = text.length > 200 ? text.slice(0, 200) : text;
    throw new ApiError(res.status, sanitized);
  }

  return res.json() as Promise<T>;
}

export async function apiStream(
  path: string,
  body: unknown,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
    credentials: 'include',
  });

  if (!res.ok || !res.body) {
    if (res.status === 401) {
      localStorage.removeItem('kitz-token');
      window.location.href = '/login';
      throw new ApiError(401, 'Unauthorized');
    }
    throw new ApiError(res.status, 'Stream failed');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data) as { text?: string };
          if (parsed.text) onChunk(parsed.text);
        } catch {
          if (data.trim()) onChunk(data);
        }
      }
    }
  }
}

export { ApiError };
