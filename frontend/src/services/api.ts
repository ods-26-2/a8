const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.erro ?? "Erro ao conectar com a API");
  }
  return data as T;
}

export function healthCheck() {
  return apiRequest<{ api: string; database: string }>("/api/health");
}