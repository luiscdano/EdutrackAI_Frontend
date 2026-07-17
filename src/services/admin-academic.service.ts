import {
  clearAuthSession,
  getAuthToken,
} from "./auth.service";

import type {
  AcademicHistoryEntry,
  AcademicResult,
  AdminSubject,
  AssignmentStatus,
  ResultFormData,
  ResultStatus,
  SubjectAssignment,
  SubjectDifficulty,
  SubjectFormData,
  SubjectStatus,
} from "../types/adminAcademic.types";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const META_PREFIX = "EDUTRACK_ADMIN:";

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data?: T;
}

interface BackendSubject {
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

interface BackendAssignment {
  id: string;
  currentAverage: string;
  difficultyLevel: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    studentCode: string;
    career: string;
  };
  subject: {
    id: string;
    name: string;
    level: string;
  };
}

interface BackendGradeChange {
  id: string;
  oldValue: string | number;
  newValue: string | number;
  reason: string | null;
  createdAt: string;
}

interface BackendGrade {
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
  gradeChanges: BackendGradeChange[];
}

interface SubjectMetadata {
  code: string;
  program: string;
  credits: number;
  difficulty: SubjectDifficulty;
}

export interface AdminAcademicSnapshot {
  subjects: AdminSubject[];
  assignments: SubjectAssignment[];
  results: AcademicResult[];
  history: AcademicHistoryEntry[];
}

const request = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  if (!API_URL) {
    throw new Error("VITE_API_URL no está configurada.");
  }

  const token = getAuthToken();

  if (!token) {
    throw new Error("No existe una sesión activa.");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401) {
    clearAuthSession();
  }

  if (!response.ok || !payload || payload.ok !== true) {
    throw new Error(
      payload?.message ?? "El servidor devolvió un error.",
    );
  }

  if (payload.data === undefined) {
    return undefined as T;
  }

  return payload.data;
};

const parseNumber = (value: string | number): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const parseSemester = (level: string): number => {
  const parsedValue = Number.parseInt(level, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : 1;
};

const parseMetadata = (
  subject: BackendSubject,
): SubjectMetadata => {
  if (subject.description.startsWith(META_PREFIX)) {
    try {
      const parsed = JSON.parse(
        subject.description.slice(META_PREFIX.length),
      ) as Partial<SubjectMetadata>;

      return {
        code:
          typeof parsed.code === "string" && parsed.code.trim()
            ? parsed.code
            : `SUB-${subject.id.slice(0, 6).toUpperCase()}`,
        program:
          typeof parsed.program === "string" && parsed.program.trim()
            ? parsed.program
            : "General",
        credits:
          typeof parsed.credits === "number"
            ? parsed.credits
            : 0,
        difficulty:
          parsed.difficulty === "low" ||
          parsed.difficulty === "high" ||
          parsed.difficulty === "medium"
            ? parsed.difficulty
            : "medium",
      };
    } catch {
      // Continúa con valores compatibles para registros anteriores.
    }
  }

  return {
    code: `SUB-${subject.id.slice(0, 6).toUpperCase()}`,
    program: subject.description || "General",
    credits: 0,
    difficulty: "medium",
  };
};

const serializeMetadata = (data: SubjectFormData): string =>
  `${META_PREFIX}${JSON.stringify({
    code: data.code.trim(),
    program: data.program.trim(),
    credits: data.credits === "" ? 0 : data.credits,
    difficulty: data.difficulty,
  } satisfies SubjectMetadata)}`;

const mapAssignmentStatus = (
  value: string,
): AssignmentStatus => {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("complete")) {
    return "completed";
  }

  if (normalized.includes("progress")) {
    return "in_progress";
  }

  return "assigned";
};

const mapResultStatus = (score: number): ResultStatus => {
  if (score >= 70) return "approved";
  if (score >= 60) return "at_risk";
  return "failed";
};

const mapSubject = (
  subject: BackendSubject,
  assignments: SubjectAssignment[],
  results: AcademicResult[],
): AdminSubject => {
  const metadata = parseMetadata(subject);
  const subjectResults = results.filter(
    (result) => result.subjectId === subject.id,
  );
  const average = subjectResults.length
    ? Math.round(
        subjectResults.reduce(
          (sum, result) => sum + result.score,
          0,
        ) / subjectResults.length,
      )
    : 0;

  return {
    id: subject.id,
    code: metadata.code,
    name: subject.name,
    program: metadata.program,
    semester: parseSemester(subject.level),
    credits: metadata.credits,
    average,
    difficulty: metadata.difficulty,
    status: subject.isActive ? "active" : "inactive",
    assignmentsCount: assignments.filter(
      (assignment) => assignment.subjectId === subject.id,
    ).length,
    resultsCount: subjectResults.length,
    updatedAt: subject.updateAt,
  };
};

const mapGrade = (grade: BackendGrade): AcademicResult => {
  const score = parseNumber(grade.gradeValue);

  return {
    id: grade.id,
    userId: grade.user.id,
    subjectId: grade.subject.id,
    studentName: `${grade.user.firstName} ${grade.user.lastName}`.trim(),
    studentCode: grade.user.studentCode,
    period: grade.gradeType,
    score,
    status: mapResultStatus(score),
    note: grade.description,
    updatedAt: grade.date,
  };
};

const mapHistory = (
  subjects: BackendSubject[],
  grades: BackendGrade[],
): AcademicHistoryEntry[] => {
  const subjectHistory = subjects.flatMap((subject) => {
    const entries: AcademicHistoryEntry[] = [
      {
        id: `subject-created-${subject.id}`,
        subjectId: subject.id,
        action: "created",
        description: `Materia ${subject.name} creada.`,
        author: "Sistema",
        createdAt: subject.createdAt,
      },
    ];

    if (subject.updateAt !== subject.createdAt) {
      entries.push({
        id: `subject-updated-${subject.id}`,
        subjectId: subject.id,
        action: "updated",
        description: `Materia ${subject.name} actualizada.`,
        author: "Sistema",
        createdAt: subject.updateAt,
      });
    }

    return entries;
  });

  const gradeHistory = grades.flatMap((grade) =>
    grade.gradeChanges.map((change) => ({
      id: change.id,
      subjectId: grade.subject.id,
      action: "result_updated" as const,
      description:
        change.reason ??
        `Calificación cambiada de ${change.oldValue} a ${change.newValue}.`,
      author: "Administrador académico",
      createdAt: change.createdAt,
    })),
  );

  return [...subjectHistory, ...gradeHistory].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() -
      new Date(left.createdAt).getTime(),
  );
};

export const getAdminAcademicSnapshot =
  async (): Promise<AdminAcademicSnapshot> => {
    const [subjects, grades] = await Promise.all([
      request<BackendSubject[]>("/subjects"),
      request<BackendGrade[]>("/grades"),
    ]);

    const assignmentGroups = await Promise.all(
      subjects.map(async (subject) => {
        if (!subject.isActive) {
          return [] as BackendAssignment[];
        }

        try {
          return await request<BackendAssignment[]>(
            `/subjects/${subject.id}/users`,
          );
        } catch {
          return [] as BackendAssignment[];
        }
      }),
    );

    const assignments = assignmentGroups
      .flat()
      .map<SubjectAssignment>((assignment) => ({
        id: assignment.id,
        userId: assignment.user.id,
        subjectId: assignment.subject.id,
        studentName:
          `${assignment.user.firstName} ${assignment.user.lastName}`.trim(),
        studentCode: assignment.user.studentCode,
        group: assignment.subject.level,
        status: mapAssignmentStatus(assignment.status),
        assignedAt: "No disponible",
        currentAverage: parseNumber(assignment.currentAverage),
      }));

    const results = grades.map(mapGrade);

    return {
      subjects: subjects.map((subject) =>
        mapSubject(subject, assignments, results),
      ),
      assignments,
      results,
      history: mapHistory(subjects, grades),
    };
  };

export const createAdminSubject = (
  data: SubjectFormData,
) =>
  request<BackendSubject>("/subjects", {
    method: "POST",
    body: JSON.stringify({
      name: data.name.trim(),
      description: serializeMetadata(data),
      level: String(data.semester),
      isActive: data.status === "active",
    }),
  });

export const updateAdminSubject = (
  subjectId: string,
  data: SubjectFormData,
) =>
  request<BackendSubject>(`/subjects/${subjectId}`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name.trim(),
      description: serializeMetadata(data),
      level: String(data.semester),
      isActive: data.status === "active",
    }),
  });

export const toggleAdminSubjectStatus = (
  subjectId: string,
  status: SubjectStatus,
) =>
  request<BackendSubject>(`/subjects/${subjectId}`, {
    method: "PUT",
    body: JSON.stringify({
      isActive: status === "active",
    }),
  });

export const upsertAcademicResult = async (
  data: ResultFormData,
  snapshot: AdminAcademicSnapshot,
): Promise<void> => {
  if (data.score === "") {
    throw new Error("Introduce una calificación válida.");
  }

  const assignment = snapshot.assignments.find(
    (item) =>
      item.subjectId === data.subjectId &&
      item.studentCode.trim().toLowerCase() ===
        data.studentCode.trim().toLowerCase(),
  );

  if (!assignment?.userId) {
    throw new Error(
      "El estudiante debe estar asignado a la materia antes de registrar una calificación.",
    );
  }

  const existingResult = snapshot.results.find(
    (result) =>
      result.subjectId === data.subjectId &&
      result.studentCode.trim().toLowerCase() ===
        data.studentCode.trim().toLowerCase() &&
      result.period === data.period,
  );

  const commonPayload = {
    gradeValue: data.score,
    gradeType: data.period.trim(),
    description: data.note.trim() || "Resultado académico",
    date: new Date().toISOString(),
  };

  if (existingResult) {
    await request<BackendGrade>(
      `/grades/${existingResult.id}`,
      {
        method: "PUT",
        body: JSON.stringify(commonPayload),
      },
    );
    return;
  }

  await request<BackendGrade>("/grades", {
    method: "POST",
    body: JSON.stringify({
      userId: assignment.userId,
      subjectId: data.subjectId,
      ...commonPayload,
    }),
  });
};
