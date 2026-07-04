import Badge from "../ui/Badge";
import Button from "../ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

import {
  getOptionLabel,
  subjectDifficultyOptions,
  subjectStatusOptions,
} from "../../data/adminAcademic.options";
import type { AdminSubject } from "../../types/adminAcademic.types";

interface SubjectTableProps {
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

const SubjectTable = ({
  subjects,
  onEdit,
  onToggleStatus,
  onOpenAssignments,
  onOpenResult,
  onOpenHistory,
}: SubjectTableProps) => {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Materia</TableHead>
            <TableHead>Programa</TableHead>
            <TableHead>Promedio</TableHead>
            <TableHead>Dificultad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignaciones</TableHead>
            <TableHead>Resultados</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>
                <div>
                  <p className="font-semibold text-content">
                    {subject.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {subject.code} · Semestre {subject.semester} ·{" "}
                    {subject.credits} créditos
                  </p>
                </div>
              </TableCell>

              <TableCell>{subject.program}</TableCell>

              <TableCell>
                <span className="font-semibold text-content">
                  {subject.average}
                </span>
              </TableCell>

              <TableCell>
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
              </TableCell>

              <TableCell>
                <Badge
                  variant={getStatusVariant(subject.status)}
                >
                  {getOptionLabel(
                    subjectStatusOptions,
                    subject.status,
                  )}
                </Badge>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenAssignments(subject)}
                >
                  Ver {subject.assignmentsCount}
                </Button>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenResult(subject)}
                >
                  Registrar
                </Button>
              </TableCell>

              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
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
                    size="sm"
                    onClick={() => onToggleStatus(subject)}
                  >
                    {subject.status === "active"
                      ? "Desactivar"
                      : "Activar"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenHistory(subject)}
                  >
                    Historial
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SubjectTable;
