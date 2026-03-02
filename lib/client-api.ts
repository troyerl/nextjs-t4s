const CLIENT_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const CLIENT_API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

export class ClientApiError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "ClientApiError";
    this.status = status;
    this.body = body;
  }
}

function buildUrl(path: string) {
  return `${CLIENT_API_URL}${path}`;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  return {
    ...(CLIENT_API_KEY ? { "x-api-key": CLIENT_API_KEY } : {}),
    ...(extra ?? {}),
  };
}

async function throwClientApiError(method: string, path: string, response: Response): Promise<never> {
  const body = await response.text();
  throw new ClientApiError(`${method} ${path} failed (${response.status})`, response.status, body);
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

export async function clientApiGet<T>(path: string): Promise<T> {
  if (!CLIENT_API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL.");
  }

  const response = await fetch(buildUrl(path), {
    method: "GET",
    cache: "no-store",
    headers: buildHeaders(),
  });

  if (!response.ok) {
    await throwClientApiError("GET", path, response);
  }

  return parseJsonResponse<T>(response);
}

export async function clientApiPost<T>(path: string, body: unknown): Promise<T> {
  if (!CLIENT_API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL.");
  }

  const response = await fetch(buildUrl(path), {
    method: "POST",
    cache: "no-store",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwClientApiError("POST", path, response);
  }

  return parseJsonResponse<T>(response);
}

export async function clientApiPut<T>(path: string, body: unknown): Promise<T> {
  if (!CLIENT_API_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL.");
  }

  const response = await fetch(buildUrl(path), {
    method: "PUT",
    cache: "no-store",
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await throwClientApiError("PUT", path, response);
  }

  return parseJsonResponse<T>(response);
}
