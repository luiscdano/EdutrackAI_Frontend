import Button from "../ui/Button";
import Card from "../ui/Card";

import type { StudySession } from "../../types/study-session.types";

interface ActivityCardProps {
  session: StudySession;
  deleting: boolean;
  onEdit: (session: StudySession) => void;
  onDelete: (session: StudySession) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const ActivityCard = ({
  session,
  deleting,
  onEdit,
  onDelete,
}: ActivityCardProps) => {
  return (
    <Card padding="md">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-content">
            {session.subject.name}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {formatDate(session.startedAt)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted">Duración</dt>
            <dd className="font-medium text-content">
              {session.durationMinutes} min
            </dd>
          </div>
          <div>
            <dt className="text-muted">Productividad</dt>
            <dd className="font-medium text-content">
              {session.productivityRating} / 5
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted">Método</dt>
            <dd className="font-medium text-content">
              {session.studyMethod}
            </dd>
          </div>
        </dl>

        <p className="text-sm leading-relaxed text-muted">
          {session.notes}
        </p>

        <div className="flex gap-3">
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
            loading={deleting}
            onClick={() => onDelete(session)}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ActivityCard;
