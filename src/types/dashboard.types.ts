export interface DashboardSummary {
  enrolledSubjects: number;
  studySessionsLast7Days: number;
  totalStudyMinutesLast7Days: number;
  averageProductivity: number;
  quizAttemptsLast7Days: number;
  averageQuizScore: number;
  unreadNotifications: number;
}

export interface DashboardPerformanceItem {
  subject: {
    id: string;
    name: string;
    level: string;
  };
  declaredAverage: string;
  grades: {
    average: number;
    count: number;
  };
  studySessions: {
    totalMinutes: number;
    count: number;
  };
}

export interface DashboardStreak {
  currentStreak: number;
  longestStreak: number;
  activeDaysLast30: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  performance: DashboardPerformanceItem[];
  streak: DashboardStreak;
}
