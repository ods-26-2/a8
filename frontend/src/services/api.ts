import { armazenamento} from "./armazenamento";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

let aoSessaoExpirar: (() => void) | null = null;
export function registrarAoSessaoExpirar(fn: (() => void) | null) {
  aoSessaoExpirar = fn;
}

export async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<T> {
  const token = await armazenamento.lerToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 
      "Content-Type": "application/json",
    ...(token ? {Authorization: `Bearer ${token}`} : {}), 
  },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      await armazenamento.limparSessao();
      aoSessaoExpirar?.();
    }
    throw new Error(data.erro ?? "Erro ao conectar com a API");
  }
  return data as T;
}

export function healthCheck() {
  return apiRequest<{ api: string; database: string }>("/api/health");
}