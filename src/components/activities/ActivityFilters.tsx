import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";

const ActivityFilters = () => {
  return (
    <Card variant="elevated" padding="md">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Filtros
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Materia */}
        <div>
          <label className="mb-1 block text-sm text-slate-400">
            Materia
          </label>

          <select className="w-full rounded-md border border-border bg-slate-900 p-2 text-white">
            <option value="">Todas</option>
            <option value="math">Matemática</option>
            <option value="programming">Programación</option>
            <option value="english">Inglés</option>
          </select>
        </div>

        {/* Fecha inicio */}
        <Input
          label="Fecha inicio"
          type="date"
        />

        {/* Fecha fin */}
        <Input
          label="Fecha fin"
          type="date"
        />

        {/* Botón */}
        <div className="flex items-end">
          <Button fullWidth>
            Filtrar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ActivityFilters;