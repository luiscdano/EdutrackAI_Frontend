import Select from "../ui/Select";

import { preferredSchedules } from "../../data/academic.options";
import type {
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
  PreferredSchedule,
} from "../../types/academic.types";

interface AcademicStepScheduleProps {
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicStepSchedule = ({
  data,
  errors,
  onChange,
}: AcademicStepScheduleProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Horario disponible
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Escoge el bloque de tiempo en el que sueles estudiar con más
          constancia.
        </p>
      </div>

      <Select
        label="Horario preferido"
        value={data.preferredSchedule}
        error={errors.preferredSchedule}
        helperText="Se usará como referencia para organizar recordatorios y metas."
        required
        onChange={(changeEvent) =>
          onChange(
            "preferredSchedule",
            changeEvent.target.value as PreferredSchedule,
          )
        }
      >
        <option value="" disabled>
          Selecciona una opción
        </option>

        {preferredSchedules.map((schedule) => (
          <option key={schedule.value} value={schedule.value}>
            {schedule.label}
          </option>
        ))}
      </Select>
    </section>
  );
};

export default AcademicStepSchedule;
