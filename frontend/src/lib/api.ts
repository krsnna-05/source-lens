const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FetchOptions = RequestInit & {
  headers?: Record<string, string>;
};

export async function fetchApi(
  endpoint: string,
  options?: FetchOptions
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

export async function getHealthStatus(): Promise<{
  status: string;
  message?: string;
}> {
  const response = await fetchApi("/api/v1/health");
  return response.json();
}
