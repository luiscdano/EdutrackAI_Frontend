import Card from "../ui/Card";

const StudySessionsChart = () => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="h-full"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">
        Sesiones de estudio
      </h2>

      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-slate-400">
          El gráfico de sesiones de los últimos siete días se mostrará aquí.
        </p>
      </div>
    </Card>
  );
};

export default StudySessionsChart;