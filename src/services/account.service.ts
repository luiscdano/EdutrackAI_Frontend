import {
  clearAuthSession,
  getAuthToken,
} from "./auth.service";

import type { AuthenticatedUser } from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

interface ApiEnvelope<T> {
  ok: boolean;
  message: string;
  data?: T;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error("VITE_API_URL no está configurada.");
  }

  const token = getAuthToken();

  if (!token) {
    throw new Error("No existe una sesión activa.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (response.status === 401) {
    clearAuthSession();
  }

  if (!response.ok || !payload || payload.ok !== true) {
    throw new Error(
      payload?.message ?? "El servidor devolvió un error.",
    );
  }

  return payload.data as T;
};

export const getCurrentAccount = () =>
  request<AuthenticatedUser>("/users/me");

export const changeAccountPassword = (
  data: ChangePasswordData,
) =>
  request<void>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
