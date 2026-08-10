import { apiRequest } from "./api-client";
import type {
  AdaptiveOverview,
  EvaluationSummary,
  StudyPlanActivity,
  UpdatePlanActivityPayload,
} from "../types/adaptive.types";

export const getAdaptiveOverview = () =>
  apiRequest<AdaptiveOverview>("/adaptive-engine/overview");

export const recalculateAdaptivePlan = () =>
  apiRequest<unknown>("/adaptive-engine/recalculate", { method: "POST" });

export const getStudyPlan = (includeHistory = false) =>
  apiRequest<StudyPlanActivity[]>(
    `/study-plan${includeHistory ? "?includeHistory=true" : ""}`,
  );

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

export const getUpcomingEvaluations = () =>
  apiRequest<EvaluationSummary[]>("/evaluations/upcoming");
