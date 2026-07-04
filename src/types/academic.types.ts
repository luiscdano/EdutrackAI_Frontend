export type AcademicLevel =
  | "secondary"
  | "technical"
  | "undergraduate"
  | "postgraduate";

export type LearningStyle =
  | "visual"
  | "auditory"
  | "reading"
  | "kinesthetic";

export type PreferredSchedule =
  | "morning"
  | "afternoon"
  | "night"
  | "weekend"
  | "flexible";

export type DifficultyOption =
  | "time_management"
  | "mathematics"
  | "reading_comprehension"
  | "programming"
  | "concentration"
  | "teamwork"
  | "communication"
  | "exam_anxiety";

export interface AcademicSettings {
  academicLevel: AcademicLevel;
  learningStyle: LearningStyle;
  preferredSchedule: PreferredSchedule;
  weeklyGoal: number;
  difficulties: DifficultyOption[];
}

export interface AcademicSettingsFormData {
  academicLevel: AcademicLevel | "";
  learningStyle: LearningStyle | "";
  preferredSchedule: PreferredSchedule | "";
  weeklyGoal: number | "";
  difficulties: DifficultyOption[];
}

export type AcademicSettingsField =
  keyof AcademicSettingsFormData;

export type AcademicValidationErrors = Partial<
  Record<AcademicSettingsField, string>
>;

export type AcademicWizardStep =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;
