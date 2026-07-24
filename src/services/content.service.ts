import {
  clearAuthSession,
  getAuthToken,
} from "./auth.service";

import type {
  AcademicGrade,
  AdminStats,
  AuditLog,
  ContentSubject,
  EducationalResource,
  PaginatedResponse,
  StudyRecommendation,
  UserNotification,
} from "../types/content.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data?: T;
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
    .catch(() => null)) as ApiResponse<T> | null;

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

export const getSubjects = () =>
  request<ContentSubject[]>("/subjects");

export const getGrades = () =>
  request<AcademicGrade[]>("/grades");

export const getResources = () =>
  request<EducationalResource[]>("/resources");

export const getRecommendations = () =>
  request<StudyRecommendation[]>("/recommendations");

export const getNotifications = () =>
  request<UserNotification[]>("/notifications");

export const markNotificationRead = (notificationId: string) =>
  request<UserNotification>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  request<{ updated: number }>("/notifications/mark-all-read", {
    method: "POST",
  });

export const getAdminStats = () =>
  request<AdminStats>("/admin/stats");

export const getAuditLogs = (page = 1, limit = 8) =>
  request<PaginatedResponse<AuditLog>>(
    `/admin/audit-logs?page=${page}&limit=${limit}`,
  );
