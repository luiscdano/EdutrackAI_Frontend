import Input from "../ui/Input";

import type {
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
} from "../../types/academic.types";

interface AcademicStepGoalProps {
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicStepGoal = ({
  data,
  errors,
  onChange,
}: AcademicStepGoalProps) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-content">
          Meta semanal
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          Define cuántas horas quieres dedicar al estudio cada semana.
        </p>
      </div>

      <Input
        label="Horas de estudio por semana"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        value={
          data.weeklyGoal === ""
            ? ""
            : String(data.weeklyGoal)
        }
        error={errors.weeklyGoal}
        helperText="Debe ser un número mayor que 0."
        required
        rightElement={
          <span className="text-sm font-medium text-muted">
            horas
          </span>
        }
        onChange={(changeEvent) => {
          const nextValue = changeEvent.target.value;

          onChange(
            "weeklyGoal",
            nextValue === "" ? "" : Number(nextValue),
          );
        }}
      />
    </section>
  );
};

export default AcademicStepGoal;
