import Button from "../ui/Button";

import type { StudySession } from "../../types/study-session.types";

interface ActivityTableProps {
  sessions: StudySession[];
  deletingId: string | null;
  onEdit: (session: StudySession) => void;
  onDelete: (session: StudySession) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const ActivityTable = ({
  sessions,
  deletingId,
  onEdit,
  onDelete,
}: ActivityTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-content">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-3 py-3">Materia</th>
            <th className="px-3 py-3">Fecha</th>
            <th className="px-3 py-3">Duración</th>
            <th className="px-3 py-3">Método</th>
            <th className="px-3 py-3">Productividad</th>
            <th className="px-3 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b border-border last:border-0">
              <td className="px-3 py-4 font-medium">
                {session.subject.name}
              </td>
              <td className="px-3 py-4 text-muted">
                {formatDate(session.startedAt)}
              </td>
              <td className="px-3 py-4">
                {session.durationMinutes} min
              </td>
              <td className="px-3 py-4">
                {session.studyMethod}
              </td>
              <td className="px-3 py-4">
                {session.productivityRating} / 5
              </td>
              <td className="px-3 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(session)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={deletingId === session.id}
                    onClick={() => onDelete(session)}
                  >
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
