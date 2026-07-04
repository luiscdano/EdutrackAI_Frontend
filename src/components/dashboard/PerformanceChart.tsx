import Card from "../ui/Card";

const PerformanceChart = () => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="h-full"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">
        Rendimiento por materia
      </h2>

      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-slate-400">
          El gráfico de rendimiento se mostrará aquí.
        </p>
      </div>
    </Card>
  );
};

export default PerformanceChart;