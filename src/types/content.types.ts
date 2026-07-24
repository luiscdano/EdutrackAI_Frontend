export interface ContentSubject {
  id: string;
  name: string;
  description: string;
  level: string;
  isActive: boolean;
  createdAt: string;
  updateAt: string;
  _count: {
    subject: number;
    quizzies: number;
    grades: number;
    studySessions: number;
    resouces: number;
    recommendations: number;
  };
}

export interface GradeChange {
  id: string;
  oldValue: string | number;
  newValue: string | number;
  reason: string | null;
  createdAt: string;
}

export interface AcademicGrade {
  id: string;
  gradeValue: string | number;
  gradeType: string;
  description: string;
  date: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode: string;
  };
  subject: {
    id: string;
    name: string;
    level: string;
  };
  gradeChanges: GradeChange[];
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  url: string;
  difficulty: string;
  topic: string;
  isActive: boolean;
  createdAt: string;
  subject: {
    id: string;
    name: string;
    level: string;
  };
}

export interface StudyRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  reason: string;
  priority: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: string;
    name: string;
    level: string;
  };
  resource: {
    id: string;
    title: string;
    url: string;
    resourceType: string;
  };
}

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  scheduleAt: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AdminStats {
  users: { total: number; active: number };
  subjects: { total: number };
  quizzes: { total: number; attempts: number };
  grades: { total: number };
  studySessions: { total: number };
  resources: { total: number };
  recommendations: { total: number };
}

export interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
