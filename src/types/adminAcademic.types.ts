export type SubjectStatus =
  | "active"
  | "inactive";

export type SubjectDifficulty =
  | "low"
  | "medium"
  | "high";

export type AssignmentStatus =
  | "assigned"
  | "in_progress"
  | "completed";

export type ResultStatus =
  | "approved"
  | "at_risk"
  | "failed"
  | "pending";

export type HistoryAction =
  | "created"
  | "updated"
  | "status_changed"
  | "result_updated"
  | "assignment_updated";

export interface AdminSubject {
  id: string;
  code: string;
  name: string;
  program: string;
  semester: number;
  credits: number;
  average: number;
  difficulty: SubjectDifficulty;
  status: SubjectStatus;
  assignmentsCount: number;
  resultsCount: number;
  updatedAt: string;
}

export interface SubjectAssignment {
  id: string;
  subjectId: string;
  studentName: string;
  studentCode: string;
  group: string;
  status: AssignmentStatus;
  assignedAt: string;
  currentAverage: number;
}

export interface AcademicResult {
  id: string;
  subjectId: string;
  studentName: string;
  studentCode: string;
  period: string;
  score: number;
  status: ResultStatus;
  note: string;
  updatedAt: string;
}

export interface AcademicHistoryEntry {
  id: string;
  subjectId: string;
  action: HistoryAction;
  description: string;
  author: string;
  createdAt: string;
}

export interface SubjectFormData {
  code: string;
  name: string;
  program: string;
  semester: number | "";
  credits: number | "";
  difficulty: SubjectDifficulty;
  status: SubjectStatus;
}

export interface ResultFormData {
  subjectId: string;
  studentName: string;
  studentCode: string;
  period: string;
  score: number | "";
  status: ResultStatus;
  note: string;
}

export interface SubjectFiltersState {
  search: string;
  status: SubjectStatus | "all";
  difficulty: SubjectDifficulty | "all";
  program: string;
}

export type SubjectFormErrors = Partial<
  Record<keyof SubjectFormData, string>
>;

export type ResultFormErrors = Partial<
  Record<keyof ResultFormData, string>
>;
