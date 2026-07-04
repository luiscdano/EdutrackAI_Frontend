import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";

import type {
  StudySessionFilters,
  SubjectOption,
} from "../../types/study-session.types";

interface ActivityFiltersProps {
  filters: StudySessionFilters;
  subjects: SubjectOption[];
  onChange: (filters: StudySessionFilters) => void;
  onClear: () => void;
}

const ActivityFilters = ({
  filters,
  subjects,
  onChange,
  onClear,
}: ActivityFiltersProps) => {
  return (
    <Card padding="md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-content">
          Filtros
        </h2>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpiar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="filter-subject" className="mb-2 block text-sm font-medium text-content">
            Materia
          </label>
          <select
            id="filter-subject"
            value={filters.subjectId}
            onChange={(event) =>
              onChange({
                ...filters,
                subjectId: event.target.value,
              })
            }
            className="min-h-11 w-full rounded-control border border-border bg-surface-muted px-4 py-2.5 text-content outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Todas las materias</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Desde"
          type="date"
          value={filters.startDate}
          onChange={(event) =>
            onChange({
              ...filters,
              startDate: event.target.value,
            })
          }
        />

        <Input
          label="Hasta"
          type="date"
          value={filters.endDate}
          onChange={(event) =>
            onChange({
              ...filters,
              endDate: event.target.value,
            })
          }
        />
      </div>
    </Card>
  );
};

export default ActivityFilters;
