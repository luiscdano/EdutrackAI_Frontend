import { apiRequest } from "./api-client";

export interface CatalogSyncResult {
  institutions: number;
  programs: number;
  uniqueSubjects: number;
  created: number;
  reused: number;
  reactivated: number;
}

export const syncAcademicCatalog = () =>
  apiRequest<CatalogSyncResult>("/student-context/catalog/sync", {
    method: "POST",
  });
