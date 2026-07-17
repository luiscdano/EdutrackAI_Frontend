import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

import {
  subjectDifficultyOptions,
  subjectStatusOptions,
} from "../../data/adminAcademic.options";
import type { SubjectFiltersState } from "../../types/adminAcademic.types";

interface SubjectFiltersProps {
  filters: SubjectFiltersState;
  programs: string[];
  totalResults: number;
  onChange: (filters: SubjectFiltersState) => void;
  onReset: () => void;
}

const SubjectFilters = ({
  filters,
  programs,
  totalResults,
  onChange,
  onReset,
}: SubjectFiltersProps) => {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.difficulty !== "all" ||
    filters.program !== "all";

  return (
    <section
      aria-label="Filtros de materias"
      className="rounded-card border border-border bg-surface p-5"
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] lg:items-end">
        <Input
          label="Buscar"
          placeholder="Código, materia o programa"
          value={filters.search}
          onChange={(event) =>
            onChange({
              ...filters,
              search: event.target.value,
            })
          }
        />

        <Select
          label="Estado"
          value={filters.status}
          onChange={(event) =>
            onChange({
              ...filters,
              status: event.target
                .value as SubjectFiltersState["status"],
            })
          }
        >
          <option value="all">Todos</option>
          {subjectStatusOptions.map((statusOption) => (
            <option
              key={statusOption.value}
              value={statusOption.value}
            >
              {statusOption.label}
            </option>
          ))}
        </Select>

        <Select
          label="Dificultad"
          value={filters.difficulty}
          onChange={(event) =>
            onChange({
              ...filters,
              difficulty: event.target
                .value as SubjectFiltersState["difficulty"],
            })
          }
        >
          <option value="all">Todas</option>
          {subjectDifficultyOptions.map(
            (difficultyOption) => (
              <option
                key={difficultyOption.value}
                value={difficultyOption.value}
              >
                {difficultyOption.label}
              </option>
            ),
          )}
        </Select>

        <Select
          label="Programa"
          value={filters.program}
          onChange={(event) =>
            onChange({
              ...filters,
              program: event.target.value,
            })
          }
        >
          <option value="all">Todos</option>
          {programs.map((program) => (
            <option key={program} value={program}>
              {program}
            </option>
          ))}
        </Select>

        <Button
          variant="outline"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Limpiar
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted">
        {totalResults} materias encontradas.
      </p>
    </section>
  );
};

export default SubjectFilters;
