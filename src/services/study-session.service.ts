import { getAuthToken } from "./auth.service";

import type {
  StudySession,
  StudySessionFormData,
  SubjectOption,
} from "../types/study-session.types";

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

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result || result.ok !== true) {
    throw new Error(
      result?.message ?? "El servidor devolvió un error.",
    );
  }

  if (result.data === undefined) {
    return undefined as T;
  }

  return result.data;
};

const toApiPayload = (data: StudySessionFormData) => ({
  startedAt: new Date(data.startedAt).toISOString(),
  endedAt: new Date(data.endedAt).toISOString(),
  notes: data.notes.trim(),
  studyMethod: data.studyMethod.trim(),
  productivityRating: data.productivityRating,
});

export const getStudySessions = () =>
  request<StudySession[]>("/study-sessions");

export const getSubjects = () =>
  request<SubjectOption[]>("/subjects");

export const createStudySession = (
  userId: string,
  data: StudySessionFormData,
) =>
  request<StudySession>("/study-sessions", {
    method: "POST",
    body: JSON.stringify({
      userId,
      subjectId: data.subjectId,
      ...toApiPayload(data),
    }),
  });

export const updateStudySession = (
  sessionId: string,
  data: StudySessionFormData,
) =>
  request<StudySession>(`/study-sessions/${sessionId}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(data)),
  });

export const deleteStudySession = async (
  sessionId: string,
): Promise<void> => {
  await request<void>(`/study-sessions/${sessionId}`, {
    method: "DELETE",
  });
};
