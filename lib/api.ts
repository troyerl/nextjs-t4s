interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? process.env.API_KEY ?? "";

function getApiUrl(path: string) {
  return `${API_URL}${path}`;
}

function getBaseHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function apiGet<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL or API_URL.");
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    method: "GET",
    cache: "no-store",
    headers: {
      ...getBaseHeaders(options.token),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET ${path} failed (${response.status}): ${text}`);
  }

  return parseJsonResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL or API_URL.");
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getBaseHeaders(options.token),
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST ${path} failed (${response.status}): ${text}`);
  }

  return parseJsonResponse<T>(response);
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL or API_URL.");
  }

  const response = await fetch(getApiUrl(path), {
    ...options,
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...getBaseHeaders(options.token),
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PUT ${path} failed (${response.status}): ${text}`);
  }

  return parseJsonResponse<T>(response);
}
