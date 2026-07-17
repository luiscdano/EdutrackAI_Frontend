import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

import {
  assignmentStatusOptions,
  getOptionLabel,
} from "../../data/adminAcademic.options";
import type {
  AdminSubject,
  AssignmentStatus,
  SubjectAssignment,
} from "../../types/adminAcademic.types";

interface AssignmentsModalProps {
  isOpen: boolean;
  subject: AdminSubject;
  assignments: SubjectAssignment[];
  onClose: () => void;
}

const getAssignmentVariant = (
  status: AssignmentStatus,
) => {
  if (status === "completed") {
    return "success";
  }

  if (status === "in_progress") {
    return "info";
  }

  return "outline";
};

const AssignmentsModal = ({
  isOpen,
  subject,
  assignments,
  onClose,
}: AssignmentsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={`Asignaciones: ${subject.name}`}
      size="xl"
      onClose={onClose}
    >
      {assignments.length === 0 ? (
        <EmptyState
          title="No hay asignaciones"
          description="Cuando esta materia tenga estudiantes asignados, aparecerán aquí."
          icon="i"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Consulta estudiantes asignados, grupo, estado y promedio actual.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead>Asignado</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-content">
                        {assignment.studentName}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {assignment.studentCode}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{assignment.group}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getAssignmentVariant(
                        assignment.status,
                      )}
                    >
                      {getOptionLabel(
                        assignmentStatusOptions,
                        assignment.status,
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {assignment.currentAverage}
                  </TableCell>
                  <TableCell>
                    {assignment.assignedAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Modal>
  );
};

export default AssignmentsModal;
