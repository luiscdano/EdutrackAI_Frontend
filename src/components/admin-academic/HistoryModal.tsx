import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";

import {
  getOptionLabel,
  historyActionOptions,
} from "../../data/adminAcademic.options";
import type {
  AcademicHistoryEntry,
  AdminSubject,
  HistoryAction,
} from "../../types/adminAcademic.types";

interface HistoryModalProps {
  isOpen: boolean;
  subject: AdminSubject;
  history: AcademicHistoryEntry[];
  onClose: () => void;
}

const getHistoryVariant = (
  action: HistoryAction,
) => {
  if (action === "created") {
    return "success";
  }

  if (action === "status_changed") {
    return "warning";
  }

  if (action === "result_updated") {
    return "info";
  }

  return "outline";
};

const HistoryModal = ({
  isOpen,
  subject,
  history,
  onClose,
}: HistoryModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={`Historial: ${subject.name}`}
      size="lg"
      onClose={onClose}
    >
      {history.length === 0 ? (
        <EmptyState
          title="Sin historial"
          description="Los cambios de materia, estado, asignaciones y resultados aparecerán aquí."
          icon="i"
        />
      ) : (
        <ol className="space-y-4">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="rounded-control border border-border bg-surface-muted p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge
                    variant={getHistoryVariant(entry.action)}
                  >
                    {getOptionLabel(
                      historyActionOptions,
                      entry.action,
                    )}
                  </Badge>

                  <p className="mt-3 text-sm leading-relaxed text-content">
                    {entry.description}
                  </p>
                </div>

                <p className="text-sm text-muted">
                  {entry.createdAt}
                </p>
              </div>

              <p className="mt-3 text-xs text-muted">
                Responsable: {entry.author}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
};

export default HistoryModal;
