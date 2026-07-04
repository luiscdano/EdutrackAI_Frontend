import AcademicStepDifficulty from "./AcademicStepDifficulty";
import AcademicStepGoal from "./AcademicStepGoal";
import AcademicStepLearning from "./AcademicStepLearning";
import AcademicStepLevel from "./AcademicStepLevel";
import AcademicStepSchedule from "./AcademicStepSchedule";

import type {
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
} from "../../types/academic.types";

interface AcademicFormProps {
  step: 1 | 2 | 3 | 4 | 5;
  data: AcademicSettingsFormData;
  errors: AcademicValidationErrors;
  onChange: <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => void;
}

const AcademicForm = ({
  step,
  data,
  errors,
  onChange,
}: AcademicFormProps) => {
  if (step === 1) {
    return (
      <AcademicStepLevel
        data={data}
        errors={errors}
        onChange={onChange}
      />
    );
  }

  if (step === 2) {
    return (
      <AcademicStepLearning
        data={data}
        errors={errors}
        onChange={onChange}
      />
    );
  }

  if (step === 3) {
    return (
      <AcademicStepSchedule
        data={data}
        errors={errors}
        onChange={onChange}
      />
    );
  }

  if (step === 4) {
    return (
      <AcademicStepGoal
        data={data}
        errors={errors}
        onChange={onChange}
      />
    );
  }

  return (
    <AcademicStepDifficulty
      data={data}
      errors={errors}
      onChange={onChange}
    />
  );
};

export default AcademicForm;
