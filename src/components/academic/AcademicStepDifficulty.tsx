import Checkbox from "../ui/Checkbox";

import { difficultyOptions } from "../../data/academic.options";
import type {
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
  DifficultyOption,
} from "../../types/academic.types";

interface AcademicStepDifficultyProps {
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicStepDifficulty = ({
  data,
  errors,
  onChange,
}: AcademicStepDifficultyProps) => {
  const toggleDifficulty = (
    difficulty: DifficultyOption,
  ) => {
    const isSelected =
      data.difficulties.includes(difficulty);

    onChange(
      "difficulties",
      isSelected
        ? data.difficulties.filter(
            (selectedDifficulty) =>
              selectedDifficulty !== difficulty,
          )
        : [...data.difficulties, difficulty],
    );
  };

  const descriptionId = errors.difficulties
    ? "academic-difficulties-error"
    : "academic-difficulties-helper";

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Principales dificultades
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Marca al menos una dificultad para priorizar el acompañamiento.
        </p>
      </div>

      <fieldset
        aria-describedby={descriptionId}
        aria-invalid={
          errors.difficulties ? true : undefined
        }
      >
        <legend className="text-sm font-medium text-content">
          Dificultades principales
          <span
            aria-hidden="true"
            className="ml-1 text-danger"
          >
            *
          </span>
        </legend>

        {!errors.difficulties && (
          <p
            id="academic-difficulties-helper"
            className="mt-1.5 text-sm text-muted"
          >
            Puedes seleccionar varias opciones.
          </p>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {difficultyOptions.map((difficultyOption) => {
            const isChecked = data.difficulties.includes(
              difficultyOption.value,
            );

            return (
              <div
                key={difficultyOption.value}
                className="rounded-control border border-border bg-surface-muted p-4"
              >
                <Checkbox
                  label={difficultyOption.label}
                  description={difficultyOption.description}
                  checked={isChecked}
                  onChange={() =>
                    toggleDifficulty(
                      difficultyOption.value,
                    )
                  }
                />
              </div>
            );
          })}
        </div>

        {errors.difficulties && (
          <p
            id="academic-difficulties-error"
            role="alert"
            className="mt-3 text-sm text-danger"
          >
            {errors.difficulties}
          </p>
        )}
      </fieldset>
    </section>
  );
};

export default AcademicStepDifficulty;
