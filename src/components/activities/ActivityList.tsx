import Button from "../ui/Button";
import Card from "../ui/Card";
import Loader from "../ui/Loader";

import ActivityCard from "./ActivityCard";
import ActivityTable from "./ActivityTable";

import type { StudySession } from "../../types/study-session.types";

interface ActivityListProps {
  sessions: StudySession[];
  loading: boolean;
  error: string | null;
  deletingId: string | null;
  onRetry: () => void;
  onEdit: (session: StudySession) => void;
  onDelete: (session: StudySession) => void;
}

const ActivityList = ({
  sessions,
  loading,
  error,
  deletingId,
  onRetry,
  onEdit,
  onDelete,
}: ActivityListProps) => {
  return (
    <Card padding="md">
      <h2 className="mb-4 text-lg font-semibold text-content">
        Actividades registradas
      </h2>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader showLabel label="Cargando actividades..." />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-control border border-danger/40 bg-danger/10 p-5 text-center">
          <p className="text-sm text-danger">{error}</p>
          <Button className="mt-4" variant="outline" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && sessions.length === 0 && (
        <div className="rounded-control border border-dashed border-border p-10 text-center">
          <p className="font-medium text-content">
            No hay actividades registradas
          </p>
          <p className="mt-2 text-sm text-muted">
            Registra una sesión para comenzar el seguimiento.
          </p>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <>
          <div className="grid gap-4 md:hidden">
            {sessions.map((session) => (
              <ActivityCard
                key={session.id}
                session={session}
                deleting={deletingId === session.id}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <ActivityTable
              sessions={sessions}
              deletingId={deletingId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export default ActivityList;
