import { apiRequest } from "./api-client";

export interface ManagedCatalogSubject {
  id: string;
  key: string;
  code: string | null;
  name: string;
  credits: number;
  period: number;
  isActive: boolean;
  managed: true;
}

export interface ManagedAcademicProgram {
  id: string;
  key: string;
  name: string;
  degreeType: string;
  totalCredits: number;
  periods: number;
  sourceUrl: string;
  isActive: boolean;
  managed: true;
  subjects: ManagedCatalogSubject[];
}

export interface ManagedInstitution {
  id: string;
  key: string;
  name: string;
  shortName: string;
  country: string;
  websiteUrl: string;
  isActive: boolean;
  managed: true;
  programs: ManagedAcademicProgram[];
}

export const getManagedAcademicCatalog = () =>
  apiRequest<ManagedInstitution[]>("/student-context/catalog/manage");

export const createManagedInstitution = (payload: {
  name: string;
  shortName: string;
  country: string;
  websiteUrl?: string;
}) => apiRequest<ManagedInstitution[]>("/student-context/catalog/institutions", {
  method: "POST",
  body: JSON.stringify(payload),
});

export const createManagedProgram = (institutionId: string, payload: {
  name: string;
  degreeType: string;
  periods: number;
  totalCredits: number;
  sourceUrl?: string;
}) => apiRequest<ManagedInstitution[]>(`/student-context/catalog/institutions/${institutionId}/programs`, {
  method: "POST",
  body: JSON.stringify(payload),
});

export const createManagedCatalogSubject = (programId: string, payload: {
  code?: string;
  name: string;
  credits: number;
  period: number;
}) => apiRequest<ManagedInstitution[]>(`/student-context/catalog/programs/${programId}/subjects`, {
  method: "POST",
  body: JSON.stringify(payload),
});
