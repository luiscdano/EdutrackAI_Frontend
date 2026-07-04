import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";

import {
  getOptionLabel,
  subjectDifficultyOptions,
  subjectStatusOptions,
} from "../../data/adminAcademic.options";
import type { AdminSubject } from "../../types/adminAcademic.types";

interface SubjectCardsProps {
  subjects: AdminSubject[];
  onEdit: (subject: AdminSubject) => void;
  onToggleStatus: (subject: AdminSubject) => void;
  onOpenAssignments: (subject: AdminSubject) => void;
  onOpenResult: (subject: AdminSubject) => void;
  onOpenHistory: (subject: AdminSubject) => void;
}

const getStatusVariant = (
  status: AdminSubject["status"],
) => {
  return status === "active" ? "success" : "outline";
};

const getDifficultyVariant = (
  difficulty: AdminSubject["difficulty"],
) => {
  if (difficulty === "high") {
    return "danger";
  }

  if (difficulty === "medium") {
    return "warning";
  }

  return "success";
};

const SubjectCards = ({
  subjects,
  onEdit,
  onToggleStatus,
  onOpenAssignments,
  onOpenResult,
  onOpenHistory,
}: SubjectCardsProps) => {
  return (
    <div className="grid gap-4 lg:hidden">
      {subjects.map((subject) => (
        <Card
          key={subject.id}
          padding="md"
          className="space-y-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                {subject.code}
              </p>

              <h2 className="mt-1 text-lg font-semibold text-content">
                {subject.name}
              </h2>

              <p className="mt-1 text-sm text-muted">
                {subject.program}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(subject.status)}>
                {getOptionLabel(
                  subjectStatusOptions,
                  subject.status,
                )}
              </Badge>

              <Badge
                variant={getDifficultyVariant(
                  subject.difficulty,
                )}
              >
                {getOptionLabel(
                  subjectDifficultyOptions,
                  subject.difficulty,
                )}
              </Badge>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Promedio</dt>
              <dd className="mt-1 font-semibold text-content">
                {subject.average}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Asignaciones</dt>
              <dd className="mt-1 font-semibold text-content">
                {subject.assignmentsCount}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Semestre</dt>
              <dd className="mt-1 font-semibold text-content">
                {subject.semester}
              </dd>
            </div>

            <div>
              <dt className="text-muted">Créditos</dt>
              <dd className="mt-1 font-semibold text-content">
                {subject.credits}
              </dd>
            </div>
          </dl>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => onEdit(subject)}
            >
              Editar
            </Button>

            <Button
              variant={
                subject.status === "active"
                  ? "danger"
                  : "secondary"
              }
              onClick={() => onToggleStatus(subject)}
            >
              {subject.status === "active"
                ? "Desactivar"
                : "Activar"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenAssignments(subject)}
            >
              Ver asignaciones
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenResult(subject)}
            >
              Registrar resultado
            </Button>

            <Button
              variant="ghost"
              className="sm:col-span-2"
              onClick={() => onOpenHistory(subject)}
            >
              Ver historial
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SubjectCards;
