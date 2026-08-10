import { apiRequest } from "./api-client";
import type {
  AdaptiveOverview,
  AdaptiveRiskHistoryEntry,
  AdminAdaptiveRiskOverview,
  EvaluationPayload,
  EvaluationSummary,
  StudyPlanActivity,
  UpdatePlanActivityPayload,
} from "../types/adaptive.types";

export const getAdaptiveOverview = () =>
  apiRequest<AdaptiveOverview>("/adaptive-engine/overview");

export const getAdaptiveHistory = (subjectId?: string, limit = 60) => {
  const params = new URLSearchParams();
  if (subjectId) params.set("subjectId", subjectId);
  params.set("limit", String(limit));
  return apiRequest<AdaptiveRiskHistoryEntry[]>(`/adaptive-engine/history?${params.toString()}`);
};

export const getAdminAdaptiveRiskOverview = () =>
  apiRequest<AdminAdaptiveRiskOverview>("/adaptive-engine/admin/risks");

export const recalculateAdaptivePlan = () =>
  apiRequest<unknown>("/adaptive-engine/recalculate", { method: "POST" });

export const getStudyPlan = (includeHistory = false) =>
  apiRequest<StudyPlanActivity[]>(
    `/study-plan${includeHistory ? "?includeHistory=true" : ""}`,
  );

export const getStudyPlanActivity = (activityId: string) =>
  apiRequest<StudyPlanActivity>(`/study-plan/${activityId}`);

export const regenerateStudyPlan = () =>
  apiRequest<StudyPlanActivity[]>("/study-plan/regenerate", { method: "POST" });

export const updateStudyPlanActivity = (
  activityId: string,
  payload: UpdatePlanActivityPayload,
) =>
  apiRequest<StudyPlanActivity>(`/study-plan/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getEvaluations = () =>
  apiRequest<EvaluationSummary[]>("/evaluations");

export const getUpcomingEvaluations = () =>
  apiRequest<EvaluationSummary[]>("/evaluations/upcoming");

export const createEvaluation = (payload: EvaluationPayload) =>
  apiRequest<EvaluationSummary>("/evaluations", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateEvaluation = (
  evaluationId: string,
  payload: Partial<Omit<EvaluationPayload, "subjectId">>,
) =>
  apiRequest<EvaluationSummary>(`/evaluations/${evaluationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deactivateEvaluation = (evaluationId: string) =>
  apiRequest<void>(`/evaluations/${evaluationId}`, { method: "DELETE" });
