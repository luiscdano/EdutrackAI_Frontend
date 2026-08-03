import { apiRequest, buildQuery } from "./api-client";
import type {
  AdminRole,
  AdminUser,
  AuditLogRecord,
  CatalogNotification,
  CatalogRecommendation,
  CatalogResource,
  NotificationPayload,
  PaginatedData,
  RecommendationPayload,
  ResourcePayload,
} from "../types/admin.types";

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityName?: string;
  userId?: string;
}

export const getAdminUsers = (filters: UserFilters = {}) => apiRequest<PaginatedData<AdminUser>>(`/admin/users${buildQuery(filters)}`);
export const getAdminRoles = () => apiRequest<AdminRole[]>("/admin/roles");
export const setAdminUserActive = (userId: string, isActive: boolean, reason?: string) => apiRequest<AdminUser>(`/admin/users/${userId}/active`, {
  method: "PATCH",
  body: JSON.stringify({ isActive, reason }),
});
export const setAdminUserRole = (userId: string, roleId: string, reason?: string) => apiRequest<AdminUser>(`/admin/users/${userId}/role`, {
  method: "PATCH",
  body: JSON.stringify({ roleId, reason }),
});
export const getAdminAuditLogs = (filters: AuditFilters = {}) => apiRequest<PaginatedData<AuditLogRecord>>(`/admin/audit-logs${buildQuery(filters)}`);

export const createCatalogResource = (payload: ResourcePayload) => apiRequest<CatalogResource>("/resources", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateCatalogResource = (id: string, payload: Partial<Omit<ResourcePayload, "subjectId">>) => apiRequest<CatalogResource>(`/resources/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteCatalogResource = (id: string) => apiRequest<void>(`/resources/${id}`, { method: "DELETE" });

export const createCatalogRecommendation = (payload: RecommendationPayload) => apiRequest<CatalogRecommendation>("/recommendations", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateCatalogRecommendation = (id: string, payload: Partial<Omit<RecommendationPayload, "userId" | "subjectId" | "resourceId">>) => apiRequest<CatalogRecommendation>(`/recommendations/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteCatalogRecommendation = (id: string) => apiRequest<void>(`/recommendations/${id}`, { method: "DELETE" });

export const createCatalogNotification = (payload: NotificationPayload) => apiRequest<CatalogNotification>("/notifications", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateCatalogNotification = (id: string, payload: Partial<Omit<NotificationPayload, "userId">>) => apiRequest<CatalogNotification>(`/notifications/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteCatalogNotification = (id: string) => apiRequest<void>(`/notifications/${id}`, { method: "DELETE" });
