import type { APIRequestContext } from "@playwright/test";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { message?: string } | string;
}

type ApiResponseLike = {
  ok(): boolean;
  status(): number;
  text(): Promise<string>;
};

export async function apiGet<T>(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  return unwrap<T>(response, path);
}

export async function apiPost<T>(request: APIRequestContext, path: string, data?: unknown) {
  const response = await request.post(path, { data });
  return unwrap<T>(response, path);
}

export async function apiPatch<T>(request: APIRequestContext, path: string, data?: unknown) {
  const response = await request.patch(path, { data });
  return unwrap<T>(response, path);
}

export async function assertApiEnvelope(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  const body = await response.text().catch(() => "");
  const json = parseJson<ApiEnvelope<unknown>>(body);
  if (response.status() >= 500) {
    throw new Error(`BE is not reachable or returned ${response.status()} for ${path}: ${body}`);
  }
  if (!json || typeof json.success !== "boolean") {
    throw new Error(`${path} does not return the expected { success, data } API envelope.`);
  }
  return json;
}

export async function assertApiReachable(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  const body = await response.text().catch(() => "");
  if (response.status() >= 500) {
    throw new Error(`BE is not reachable or returned ${response.status()} for ${path}: ${body}`);
  }
  return { status: response.status(), body };
}

async function unwrap<T>(response: ApiResponseLike, path: string) {
  const body = await response.text().catch(() => "");
  const json = parseJson<ApiEnvelope<T>>(body);
  if (!response.ok() || !json?.success) {
    const message =
      typeof json?.error === "string"
        ? json.error
        : json?.error?.message ?? body;
    throw new Error(`${path} failed with ${response.status()}: ${message}`);
  }
  return json.data;
}

function parseJson<T>(body: string) {
  if (!body) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}
