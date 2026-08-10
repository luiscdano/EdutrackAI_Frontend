export type RiskLevel = "stable" | "watch" | "attention" | "high";
export type PlanActivityStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface AdaptiveRisk {
  subjectId: string;
  score: number;
  level: RiskLevel;
  components: Record<string, number>;
  reasons: string[];
  trigger: string;
  evaluatedAt: string;
  subject: {
    name: string;
  };
}

export interface StudyPlanActivity {
  id: string;
  engineKey?: string;
  title: string;
  description: string;
  activityType: string;
  topic: string | null;
  scheduledFor: string;
  durationMinutes: number;
  priorityScore: number;
  priorityLevel: RiskLevel;
  status: PlanActivityStatus;
  source?: string;
  reason: string;
  completedAt?: string | null;
  createdAt?: string;
  updateAt?: string;
  subject: {
    id: string;
    name: string;
    level?: string;
  };
  evaluation: {
    id: string;
    title: string;
    evaluationType?: string;
    scheduledAt: string;
  } | null;
  recommendation: {
    id: string;
    title: string;
    description?: string;
    reason?: string;
    priority?: string;
    resource: {
      id: string;
      title: string;
      description?: string;
      resourceType: string;
      url: string;
      topic?: string;
    };
  } | null;
}

export interface AdaptiveOverview {
  generatedAt: string;
  priority: AdaptiveRisk | null;
  risks: AdaptiveRisk[];
  plan: StudyPlanActivity[];
}

export interface EvaluationSummary {
  id: string;
  title: string;
  description: string | null;
  evaluationType: string;
  scheduledAt: string;
  weight: string | number | null;
  isActive: boolean;
  createdAt?: string;
  updateAt?: string;
  subject: {
    id: string;
    name: string;
    level: string;
  };
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface EvaluationPayload {
  subjectId: string;
  title: string;
  description?: string;
  evaluationType: string;
  scheduledAt: string;
  weight?: number;
  isActive?: boolean;
}

export interface UpdatePlanActivityPayload {
  scheduledFor?: string;
  durationMinutes?: number;
  status?: PlanActivityStatus;
}
