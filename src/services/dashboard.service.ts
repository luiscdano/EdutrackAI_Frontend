import { getAuthToken } from "./auth.service";

import type {
  DashboardData,
  DashboardPerformanceItem,
  DashboardStreak,
  DashboardSummary,
} from "../types/dashboard.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data?: T;
}

const request = async <T>(endpoint: string): Promise<T> => {
  if (!API_URL) {
    throw new Error("VITE_API_URL no está configurada.");
  }

  const token = getAuthToken();

  if (!token) {
    throw new Error("No existe una sesión activa.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result || result.ok !== true || result.data === undefined) {
    throw new Error(
      result?.message ?? "El servidor devolvió un error.",
    );
  }

  return result.data;
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const [summary, performance, streak] = await Promise.all([
    request<DashboardSummary>("/dashboard/summary"),
    request<DashboardPerformanceItem[]>("/dashboard/performance"),
    request<DashboardStreak>("/dashboard/streak"),
  ]);

  return {
    summary,
    performance,
    streak,
  };
};
