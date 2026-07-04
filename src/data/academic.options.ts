import type {
  AcademicLevel,
  DifficultyOption,
  LearningStyle,
  PreferredSchedule,
} from "../types/academic.types";

export interface AcademicOption<T> {
  label: string;
  value: T;
  description?: string;
}

export const academicLevels: AcademicOption<AcademicLevel>[] = [
  {
    label: "Educación secundaria",
    value: "secondary",
  },
  {
    label: "Técnico superior",
    value: "technical",
  },
  {
    label: "Grado universitario",
    value: "undergraduate",
  },
  {
    label: "Postgrado",
    value: "postgraduate",
  },
];

export const learningStyles: AcademicOption<LearningStyle>[] = [
  {
    label: "Visual",
    value: "visual",
  },
  {
    label: "Auditivo",
    value: "auditory",
  },
  {
    label: "Lectura y escritura",
    value: "reading",
  },
  {
    label: "Práctico",
    value: "kinesthetic",
  },
];

export const preferredSchedules: AcademicOption<PreferredSchedule>[] = [
  {
    label: "Mañana",
    value: "morning",
  },
  {
    label: "Tarde",
    value: "afternoon",
  },
  {
    label: "Noche",
    value: "night",
  },
  {
    label: "Fin de semana",
    value: "weekend",
  },
  {
    label: "Flexible",
    value: "flexible",
  },
];

export const difficultyOptions: AcademicOption<DifficultyOption>[] = [
  {
    label: "Gestión del tiempo",
    value: "time_management",
    description: "Organizar horarios, tareas y entregas.",
  },
  {
    label: "Matemáticas",
    value: "mathematics",
    description: "Resolver problemas numericos o logicos.",
  },
  {
    label: "Comprensión lectora",
    value: "reading_comprehension",
    description: "Analizar textos, guias o documentacion.",
  },
  {
    label: "Programacion",
    value: "programming",
    description: "Practicar codigo, algoritmos o depuracion.",
  },
  {
    label: "Concentracion",
    value: "concentration",
    description: "Mantener foco durante sesiones de estudio.",
  },
  {
    label: "Trabajo en equipo",
    value: "teamwork",
    description: "Coordinar tareas y acuerdos grupales.",
  },
  {
    label: "Comunicacion",
    value: "communication",
    description: "Explicar ideas, dudas o avances.",
  },
  {
    label: "Ansiedad ante exámenes",
    value: "exam_anxiety",
    description: "Prepararte y responder bajo presion.",
  },
];
