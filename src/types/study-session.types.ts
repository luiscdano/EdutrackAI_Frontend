export interface StudySessionUser {
  id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
}

export interface StudySessionSubject {
  id: string;
  name: string;
  level: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  notes: string;
  studyMethod: string;
  productivityRating: number;
  user: StudySessionUser;
  subject: StudySessionSubject;
}

export interface SubjectOption {
  id: string;
  name: string;
  level: string;
  isActive?: boolean;
}

export interface StudySessionFormData {
  subjectId: string;
  startedAt: string;
  endedAt: string;
  notes: string;
  studyMethod: string;
  productivityRating: number;
}

export interface StudySessionFilters {
  subjectId: string;
  startDate: string;
  endDate: string;
}
