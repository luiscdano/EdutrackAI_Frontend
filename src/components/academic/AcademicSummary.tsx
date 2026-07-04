import Badge from "../ui/Badge";

import {
  academicLevels,
  difficultyOptions,
  learningStyles,
  preferredSchedules,
  type AcademicOption,
} from "../../data/academic.options";
import type {
  AcademicSettingsFormData,
  DifficultyOption,
} from "../../types/academic.types";

interface AcademicSummaryProps {
  data: AcademicSettingsFormData;
}

const findOptionLabel = <Value,>(
  options: AcademicOption<Value>[],
  value: Value | "",
) => {
  if (value === "") {
    return "No definido";
  }

  return (
    options.find((option) => option.value === value)
      ?.label ?? "No definido"
  );
};

const getDifficultyLabel = (
  difficulty: DifficultyOption,
) => {
  return (
    difficultyOptions.find(
      (option) => option.value === difficulty,
    )?.label ?? difficulty
  );
};

const AcademicSummary = ({
  data,
}: AcademicSummaryProps) => {
  const summaryItems = [
    {
      label: "Nivel académico",
      value: findOptionLabel(
        academicLevels,
        data.academicLevel,
      ),
    },
    {
      label: "Estilo de aprendizaje",
      value: findOptionLabel(
        learningStyles,
        data.learningStyle,
      ),
    },
    {
      label: "Horario preferido",
      value: findOptionLabel(
        preferredSchedules,
        data.preferredSchedule,
      ),
    },
    {
      label: "Meta semanal",
      value:
        data.weeklyGoal === ""
          ? "No definida"
          : `${data.weeklyGoal} horas`,
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Revisa tu configuración
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Confirma que los datos sean correctos antes de guardarlos.
        </p>
      </div>

      <dl className="grid gap-5 md:grid-cols-2">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="border-l-2 border-primary/50 pl-4"
          >
            <dt className="text-sm font-medium text-muted">
              {item.label}
            </dt>

            <dd className="mt-1 text-base font-semibold text-content">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="text-sm font-medium text-muted">
          Principales dificultades
        </p>

        {data.difficulties.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {data.difficulties.map((difficulty) => (
              <Badge
                key={difficulty}
                variant="info"
                size="md"
              >
                {getDifficultyLabel(difficulty)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No se han seleccionado dificultades.
          </p>
        )}
      </div>
    </section>
  );
};

export default AcademicSummary;
