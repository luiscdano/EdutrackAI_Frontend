import StatsCard from "./StatsCard";

const SummarySection = () => {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard
        title="Materias inscritas"
        value="--"
        subtitle="Pendiente de la API"
      />

      <StatsCard
        title="Sesiones de estudio"
        value="--"
        subtitle="Últimos 7 días"
      />

      <StatsCard
        title="Minutos estudiados"
        value="--"
        subtitle="Pendiente de la API"
      />

      <StatsCard
        title="Productividad promedio"
        value="--"
        subtitle="Pendiente de la API"
      />
    </section>
  );
};

export default SummarySection;