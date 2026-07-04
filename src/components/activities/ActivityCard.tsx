import Card from "../ui/Card";

const ActivityCard = () => {
  return (
    <Card variant="elevated" padding="md">
      <div className="space-y-2">
        <h3 className="text-white font-semibold">
          Actividad de estudio
        </h3>

        <p className="text-sm text-slate-400">
          Materia: --
        </p>

        <p className="text-sm text-slate-400">
          Duración: --
        </p>

        <p className="text-sm text-slate-400">
          Método: --
        </p>
      </div>
    </Card>
  );
};

export default ActivityCard;