import Select from "../ui/Select";

import { academicLevels } from "../../data/academic.options";
import type {
  AcademicLevel,
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
} from "../../types/academic.types";

interface AcademicStepLevelProps {
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicStepLevel = ({
  data,
  errors,
  onChange,
}: AcademicStepLevelProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Nivel académico
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Selecciona el nivel que describe mejor tu etapa actual de estudio.
        </p>
      </div>

      <Select
        label="Nivel académico"
        value={data.academicLevel}
        error={errors.academicLevel}
        helperText="Este dato ayuda a ajustar el nivel de las recomendaciones."
        required
        onChange={(changeEvent) =>
          onChange(
            "academicLevel",
            changeEvent.target.value as AcademicLevel,
          )
        }
      >
        <option value="" disabled>
          Selecciona una opción
        </option>

        {academicLevels.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </Select>
    </section>
  );
};

export default AcademicStepLevel;
