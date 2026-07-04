import Button from "../ui/Button";

interface ActivitiesHeaderProps {
  onCreate: () => void;
  onBack: () => void;
}

const ActivitiesHeader = ({
  onCreate,
  onBack,
}: ActivitiesHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Seguimiento académico
        </p>
        <h1 className="mt-2 text-3xl font-bold text-content">
          Actividades de estudio
        </h1>
        <p className="mt-2 text-muted">
          Registra, consulta, edita y elimina tus sesiones de estudio.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onCreate}>
          Nueva actividad
        </Button>
      </div>
    </div>
  );
};

export default ActivitiesHeader;
