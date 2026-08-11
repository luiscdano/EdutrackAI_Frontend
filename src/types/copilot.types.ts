import type { StudentContextRecord } from "./student-context.types";

export interface CopilotAction {
  activityId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  durationMinutes: number;
  activityType: string;
  topic: string | null;
  label: string;
}

export interface CopilotPulse {
  generatedAt: string;
  context: StudentContextRecord | null;
  headline: string;
  message: string;
  priorityState: string;
  action: CopilotAction | null;
  upcomingEvaluation: {
    id: string;
    title: string;
    evaluationType: string;
    scheduledAt: string;
    subject: { id: string; name: string };
    daysUntil: number;
  } | null;
  week: {
    studyMinutes: number;
    studySessions: number;
    quizScore: number;
    quizAttempts: number;
    streakDays: number;
  };
  activeSubjects: Array<{
    id: string;
    curriculumCode: string | null;
    curriculumPeriod: number | null;
    source: string;
    subject: { id: string; name: string };
  }>;
  suggestedPrompts: string[];
}

export interface CopilotReply {
  answer: string;
  action: CopilotAction | null;
  resourceDiscovery?: {
    subjectId: string;
    topic?: string;
  } | null;
  suggestedPrompts: string[];
}
