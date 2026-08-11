export interface CatalogSubject {
  key: string;
  code: string | null;
  name: string;
  credits: number;
  period: number;
  prerequisites?: string[];
}

export interface AcademicProgramCatalog {
  key: string;
  name: string;
  degreeType: string;
  totalCredits: number;
  periods: number;
  sourceUrl: string;
  subjects: CatalogSubject[];
}

export interface InstitutionCatalog {
  key: string;
  name: string;
  shortName: string;
  country: string;
  websiteUrl: string;
  programs: AcademicProgramCatalog[];
}

export interface StudentContextRecord {
  id: string;
  userId: string;
  institutionKey: string;
  institutionName: string;
  programKey: string;
  programName: string;
  currentPeriod: number;
  sourceUrl: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updateAt: string;
}

export interface StudentSubjectAssignment {
  id: string;
  currentAverage: string;
  difficultyLevel: string;
  status: string;
  curriculumCode: string | null;
  curriculumPeriod: number | null;
  source: string;
  subject: {
    id: string;
    name: string;
    description: string;
    level: string;
    isActive: boolean;
  };
}

export interface StudentContextOverview {
  context: StudentContextRecord | null;
  subjects: StudentSubjectAssignment[];
}

export interface ApplyCatalogPayload {
  institutionKey: string;
  programKey: string;
  currentPeriod: number;
  selectedSubjectKeys: string[];
}

export interface CustomSubjectPayload {
  name: string;
  description?: string;
  difficultyLevel?: "low" | "medium" | "high";
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  url: string;
  provider: string;
  resourceType: string;
  topic: string;
  difficulty: string;
  sourceKind: "course_resource" | "provider_search";
  verifiedProvider: boolean;
}

export interface LearningResourceDiscovery {
  subject: {
    id: string;
    name: string;
    level: string;
  };
  topic: string | null;
  resources: LearningResource[];
}
