import { clearAuthSession, getAuthToken } from "./auth.service";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

interface ApiEnvelope<T> {
  ok: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export interface ApiRequestOptions extends RequestInit {
  authenticated?: boolean;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error("VITE_API_URL no está configurada.");
  }

  const { authenticated = true, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);

  if (authenticated) {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No existe una sesión activa.");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (response.status === 401) {
    clearAuthSession();
    window.dispatchEvent(new Event("edutrack:unauthorized"));
  }

  if (!response.ok || !payload || payload.ok !== true) {
    const defaults: Record<number, string> = {
      400: "La solicitud contiene datos inválidos.",
      401: "Tu sesión expiró. Inicia sesión nuevamente.",
      403: "No tienes permiso para realizar esta acción.",
      404: "El recurso solicitado no existe.",
      409: "La operación entra en conflicto con datos existentes.",
      422: "No fue posible validar la información.",
      500: "Ocurrió un error interno en el servidor.",
    };

    throw new Error(payload?.message ?? defaults[response.status] ?? "El servidor devolvió un error.");
  }

  return payload.data as T;
};

export const buildQuery = (values: object) => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};
