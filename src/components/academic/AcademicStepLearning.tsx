import Select from "../ui/Select";

import { learningStyles } from "../../data/academic.options";
import type {
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
  LearningStyle,
} from "../../types/academic.types";

interface AcademicStepLearningProps {
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicStepLearning = ({
  data,
  errors,
  onChange,
}: AcademicStepLearningProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Estilo de aprendizaje
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Indica cómo prefieres estudiar y procesar nueva información.
        </p>
      </div>

      <Select
        label="Estilo de aprendizaje"
        value={data.learningStyle}
        error={errors.learningStyle}
        helperText="Puedes actualizarlo luego si cambia tu preferencia."
        required
        onChange={(changeEvent) =>
          onChange(
            "learningStyle",
            changeEvent.target.value as LearningStyle,
          )
        }
      >
        <option value="" disabled>
          Selecciona una opción
        </option>

        {learningStyles.map((style) => (
          <option key={style.value} value={style.value}>
            {style.label}
          </option>
        ))}
      </Select>
    </section>
  );
};

export default AcademicStepLearning;
