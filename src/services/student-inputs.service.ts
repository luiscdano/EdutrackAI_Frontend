import { apiRequest, buildQuery } from "./api-client";
import type { AcademicGrade } from "../types/content.types";
import type {
  CreateStudentAcademicItemPayload,
  StudentAcademicItem,
  StudentAcademicItemType,
} from "../types/student-context.types";

export const getStudentAcademicItems = (filters: {
  subjectId?: string;
  itemType?: StudentAcademicItemType;
} = {}) =>
  apiRequest<StudentAcademicItem[]>(
    `/student-inputs${buildQuery(filters)}`,
  );

export const createStudentAcademicItem = (
  payload: CreateStudentAcademicItemPayload,
) =>
  apiRequest<StudentAcademicItem>("/student-inputs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteStudentAcademicItem = (id: string) =>
  apiRequest<void>(`/student-inputs/${id}`, { method: "DELETE" });

export const createStudentGrade = (payload: {
  userId: string;
  subjectId: string;
  gradeValue: number;
  gradeType: string;
  description: string;
  date: string;
}) =>
  apiRequest<AcademicGrade>("/grades", {
    method: "POST",
    body: JSON.stringify(payload),
  });
