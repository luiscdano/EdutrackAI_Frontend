import Button from "../ui/Button";
import Card from "../ui/Card";

const QuickActions = () => {
  return (
    <Card
      variant="elevated"
      padding="lg"
      className="h-full"
    >
      <h2 className="mb-6 text-xl font-semibold text-white">
        Accesos rápidos
      </h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Button fullWidth>
          Estudiar
        </Button>

        <Button fullWidth>
          Realizar Quiz
        </Button>

        <Button fullWidth>
          Ver Recomendaciones
        </Button>
      </div>
    </Card>
  );
};

export default QuickActions;