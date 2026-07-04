import Card from "../ui/Card";
import ActivityCard from "./ActivityCard";
import ActivityTable from "./ActivityTable";

const ActivityList = () => {
  const hasData = false; // solo visual por ahora

  return (
    <Card variant="elevated" padding="md">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Actividades registradas
      </h2>

      {/* Estado vacío */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-slate-400">
            No hay actividades registradas todavía
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Cuando agregues actividades, aparecerán aquí
          </p>
        </div>
      )}

      {/* Vista móvil (cards) */}
      {hasData && (
        <div className="grid gap-4 md:hidden">
          <ActivityCard />
          <ActivityCard />
        </div>
      )}

      {/* Vista escritorio (tabla) */}
      {hasData && (
        <div className="hidden md:block">
          <ActivityTable />
        </div>
      )}
    </Card>
  );
};

export default ActivityList;