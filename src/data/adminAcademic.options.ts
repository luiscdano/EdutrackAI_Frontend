import type {
  AssignmentStatus,
  HistoryAction,
  ResultStatus,
  SubjectDifficulty,
  SubjectStatus,
} from "../types/adminAcademic.types";

export interface AdminAcademicOption<T> {
  label: string;
  value: T;
}

export const subjectStatusOptions: AdminAcademicOption<SubjectStatus>[] =
  [
    {
      label: "Activa",
      value: "active",
    },
    {
      label: "Inactiva",
      value: "inactive",
    },
  ];

export const subjectDifficultyOptions: AdminAcademicOption<SubjectDifficulty>[] =
  [
    {
      label: "Baja",
      value: "low",
    },
    {
      label: "Media",
      value: "medium",
    },
    {
      label: "Alta",
      value: "high",
    },
  ];

export const assignmentStatusOptions: AdminAcademicOption<AssignmentStatus>[] =
  [
    {
      label: "Asignada",
      value: "assigned",
    },
    {
      label: "En progreso",
      value: "in_progress",
    },
    {
      label: "Completada",
      value: "completed",
    },
  ];

export const resultStatusOptions: AdminAcademicOption<ResultStatus>[] =
  [
    {
      label: "Aprobado",
      value: "approved",
    },
    {
      label: "En riesgo",
      value: "at_risk",
    },
    {
      label: "Reprobado",
      value: "failed",
    },
    {
      label: "Pendiente",
      value: "pending",
    },
  ];

export const historyActionOptions: AdminAcademicOption<HistoryAction>[] =
  [
    {
      label: "Creación",
      value: "created",
    },
    {
      label: "Actualización",
      value: "updated",
    },
    {
      label: "Cambio de estado",
      value: "status_changed",
    },
    {
      label: "Resultado académico",
      value: "result_updated",
    },
    {
      label: "Asignación",
      value: "assignment_updated",
    },
  ];

export const academicPeriodOptions: AdminAcademicOption<string>[] =
  [
    {
      label: "2026-1",
      value: "2026-1",
    },
    {
      label: "2026-2",
      value: "2026-2",
    },
    {
      label: "2025-3",
      value: "2025-3",
    },
  ];

export const getOptionLabel = <Value,>(
  options: AdminAcademicOption<Value>[],
  value: Value,
) => {
  return (
    options.find((option) => option.value === value)
      ?.label ?? String(value)
  );
};
