import { apiRequest } from "./api-client";
import type {
  ApplyCatalogPayload,
  CustomSubjectPayload,
  InstitutionCatalog,
  StudentContextOverview,
  StudentSubjectAssignment,
} from "../types/student-context.types";

export const getAcademicCatalog = () =>
  apiRequest<InstitutionCatalog[]>("/student-context/catalog");

export const getStudentContext = () =>
  apiRequest<StudentContextOverview>("/student-context/me");

export const applyAcademicCatalog = (payload: ApplyCatalogPayload) =>
  apiRequest<StudentContextOverview>("/student-context/apply", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const addCustomSubject = (payload: CustomSubjectPayload) =>
  apiRequest<StudentSubjectAssignment>("/student-context/subjects/custom", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateMySubject = (
  assignmentId: string,
  payload: { difficultyLevel?: "low" | "medium" | "high"; status?: "active" | "inactive" },
) =>
  apiRequest<StudentSubjectAssignment>(`/student-context/subjects/${assignmentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const removeMySubject = (assignmentId: string) =>
  apiRequest<StudentSubjectAssignment>(`/student-context/subjects/${assignmentId}`, {
    method: "DELETE",
  });
