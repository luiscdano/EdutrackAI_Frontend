import { useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Card from "../ui/Card";

import AcademicForm from "./AcademicForm";
import AcademicProgress from "./AcademicProgress";
import AcademicSummary from "./AcademicSummary";

import type {
  AcademicSettings,
  AcademicSettingsField,
  AcademicSettingsFormData,
  AcademicValidationErrors,
  AcademicWizardStep,
} from "../../types/academic.types";

const TOTAL_STEPS = 6;

const emptyData: AcademicSettingsFormData = {
  academicLevel: "",
  learningStyle: "",
  preferredSchedule: "",
  weeklyGoal: "",
  difficulties: [],
};

interface AcademicWizardProps {
  initialData?: AcademicSettings | null;
  onSubmit?: (
    data: AcademicSettings,
  ) => void | Promise<void>;
  onContinueToDashboard?: () => void;
}

const createInitialData = (
  initialData?: AcademicSettings | null,
): AcademicSettingsFormData => {
  if (!initialData) {
    return emptyData;
  }

  return {
    academicLevel: initialData.academicLevel,
    learningStyle: initialData.learningStyle,
    preferredSchedule: initialData.preferredSchedule,
    weeklyGoal: initialData.weeklyGoal,
    difficulties: initialData.difficulties,
  };
};

const getInitialDataKey = (
  initialData?: AcademicSettings | null,
) => {
  if (!initialData) {
    return "empty";
  }

  return [
    initialData.academicLevel,
    initialData.learningStyle,
    initialData.preferredSchedule,
    initialData.weeklyGoal,
    initialData.difficulties.join(","),
  ].join("|");
};

const validateStep = (
  step: AcademicWizardStep,
  data: AcademicSettingsFormData,
): AcademicValidationErrors => {
  const nextErrors: AcademicValidationErrors = {};

  if (step === 1 && !data.academicLevel) {
    nextErrors.academicLevel =
      "Selecciona tu nivel académico.";
  }

  if (step === 2 && !data.learningStyle) {
    nextErrors.learningStyle =
      "Selecciona tu estilo de aprendizaje.";
  }

  if (step === 3 && !data.preferredSchedule) {
    nextErrors.preferredSchedule =
      "Selecciona tu horario preferido.";
  }

  if (
    step === 4 &&
    (data.weeklyGoal === "" ||
      !Number.isFinite(data.weeklyGoal) ||
      data.weeklyGoal <= 0)
  ) {
    nextErrors.weeklyGoal =
      "La meta semanal debe ser mayor que 0.";
  }

  if (step === 5 && data.difficulties.length === 0) {
    nextErrors.difficulties =
      "Selecciona al menos una dificultad.";
  }

  return nextErrors;
};

const validateAllSteps = (
  data: AcademicSettingsFormData,
) => {
  return {
    ...validateStep(1, data),
    ...validateStep(2, data),
    ...validateStep(3, data),
    ...validateStep(4, data),
    ...validateStep(5, data),
  };
};

const getFirstInvalidStep = (
  errors: AcademicValidationErrors,
): AcademicWizardStep => {
  if (errors.academicLevel) {
    return 1;
  }

  if (errors.learningStyle) {
    return 2;
  }

  if (errors.preferredSchedule) {
    return 3;
  }

  if (errors.weeklyGoal) {
    return 4;
  }

  if (errors.difficulties) {
    return 5;
  }

  return 6;
};

const toAcademicSettings = (
  data: AcademicSettingsFormData,
): AcademicSettings | null => {
  if (
    !data.academicLevel ||
    !data.learningStyle ||
    !data.preferredSchedule ||
    data.weeklyGoal === "" ||
    data.weeklyGoal <= 0 ||
    data.difficulties.length === 0
  ) {
    return null;
  }

  return {
    academicLevel: data.academicLevel,
    learningStyle: data.learningStyle,
    preferredSchedule: data.preferredSchedule,
    weeklyGoal: data.weeklyGoal,
    difficulties: data.difficulties,
  };
};

const AcademicWizardContent = ({
  initialData,
  onSubmit,
  onContinueToDashboard,
}: AcademicWizardProps) => {
  const [currentStep, setCurrentStep] =
    useState<AcademicWizardStep>(1);
  const [data, setData] =
    useState<AcademicSettingsFormData>(() =>
      createInitialData(initialData),
    );
  const [errors, setErrors] =
    useState<AcademicValidationErrors>({});
  const [submitError, setSubmitError] =
    useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const handleChange = <Field extends AcademicSettingsField>(
    field: Field,
    value: AcademicSettingsFormData[Field],
  ) => {
    setData((currentData) => ({
      ...currentData,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const goToNextStep = () => {
    const stepErrors = validateStep(
      currentStep,
      data,
    );

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setErrors({});

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(
        (currentStepValue) =>
          (currentStepValue + 1) as AcademicWizardStep,
      );
    }
  };

  const goToPreviousStep = () => {
    setSubmitError("");

    if (currentStep > 1) {
      setCurrentStep(
        (currentStepValue) =>
          (currentStepValue - 1) as AcademicWizardStep,
      );
    }
  };

  const handleSubmit = async () => {
    const allErrors = validateAllSteps(data);

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setCurrentStep(getFirstInvalidStep(allErrors));
      return;
    }

    const submittedData = toAcademicSettings(data);

    if (!submittedData) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      await onSubmit?.(submittedData);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la configuración.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <div className="space-y-8">
          <Alert
            variant="success"
            title="Configuración guardada"
          >
            Tu perfil académico quedó listo para personalizar tu
            experiencia de estudio.
          </Alert>

          <AcademicSummary data={data} />

          <div className="flex justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onContinueToDashboard}
            >
              Continuar al dashboard
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <AcademicProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />

      <div className="mt-8">
        {submitError && (
          <Alert
            variant="danger"
            title="No se pudo guardar"
            className="mb-6"
          >
            {submitError}
          </Alert>
        )}

        {currentStep <= 5 ? (
          <AcademicForm
            step={currentStep as 1 | 2 | 3 | 4 | 5}
            data={data}
            errors={errors}
            onChange={handleChange}
          />
        ) : (
          <AcademicSummary data={data} />
        )}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={goToPreviousStep}
          disabled={currentStep === 1 || isSubmitting}
        >
          Anterior
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button
            className="w-full sm:w-auto"
            onClick={goToNextStep}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            Guardar configuración
          </Button>
        )}
      </div>
    </Card>
  );
};

const AcademicWizard = ({
  initialData,
  onSubmit,
  onContinueToDashboard,
}: AcademicWizardProps) => {
  return (
    <AcademicWizardContent
      key={getInitialDataKey(initialData)}
      initialData={initialData}
      onSubmit={onSubmit}
      onContinueToDashboard={onContinueToDashboard}
    />
  );
};

export default AcademicWizard;
