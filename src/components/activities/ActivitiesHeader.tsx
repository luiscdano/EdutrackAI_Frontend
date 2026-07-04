import Button from "../ui/Button";

const ActivitiesHeader = () => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Texto */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Actividades de estudio
        </h1>

        <p className="mt-2 text-slate-400">
          Registra y consulta tus sesiones de estudio de forma organizada.
        </p>
      </div>

      {/* Acción visual */}
      <div>
        <Button>
          Nueva actividad
        </Button>
      </div>
    </div>
  );
};

export default ActivitiesHeader;