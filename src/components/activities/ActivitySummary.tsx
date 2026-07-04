import Card from "../ui/Card";

const ActivitySummary = () => {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {/* Total de horas */}
      <Card variant="elevated" padding="md">
        <h3 className="text-sm text-slate-400">Total de horas</h3>

        <p className="mt-2 text-3xl font-bold text-white">
          --
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Tiempo acumulado de estudio
        </p>
      </Card>

      {/* Productividad */}
      <Card variant="elevated" padding="md">
        <h3 className="text-sm text-slate-400">Productividad</h3>

        <p className="mt-2 text-3xl font-bold text-white">
          --
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Promedio general
        </p>
      </Card>

      {/* Actividades */}
      <Card variant="elevated" padding="md">
        <h3 className="text-sm text-slate-400">Actividades</h3>

        <p className="mt-2 text-3xl font-bold text-white">
          --
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Total registradas
        </p>
      </Card>
    </section>
  );
};

export default ActivitySummary;