import Card from "../ui/Card";

const StreakCard = () => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="h-full"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">
        Racha de estudio
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-slate-400">Racha actual</span>
          <span className="text-xl font-bold text-white">--</span>
        </div>

        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-slate-400">Mejor racha</span>
          <span className="text-xl font-bold text-white">--</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Días activos</span>
          <span className="text-xl font-bold text-white">--</span>
        </div>
      </div>
    </Card>
  );
};

export default StreakCard;