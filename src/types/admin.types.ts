import type {
  EducationalResource,
  StudyRecommendation,
  UserNotification,
} from "./content.types";

export interface AdminRole {
  id: string;
  name: string;
  description: string | null;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentCode: string;
  career: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
  updateAt: string;
  role: AdminRole;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: unknown;
  newValues: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface ResourcePayload {
  subjectId: string;
  title: string;
  description: string;
  resourceType: string;
  url: string;
  difficulty: string;
  topic: string;
  isActive?: boolean;
}

export interface RecommendationPayload {
  userId: string;
  subjectId: string;
  resourceId: string;
  type: string;
  title: string;
  description: string;
  reason: string;
  priority: string;
  status: string;
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  scheduleAt?: string;
  isRead?: boolean;
}

export type CatalogResource = EducationalResource;
export type CatalogRecommendation = StudyRecommendation;
export type CatalogNotification = UserNotification;
