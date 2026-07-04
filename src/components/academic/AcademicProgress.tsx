import Badge from "../ui/Badge";

interface AcademicProgressProps {
  currentStep: number;
  totalSteps: number;
}

const AcademicProgress = ({
  currentStep,
  totalSteps,
}: AcademicProgressProps) => {
  const percentage =
    (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">

      <div className="mb-3 flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold text-content">
            Configuración académica
          </h1>

          <p className="mt-1 text-sm text-muted">
            Completa la información para personalizar tu experiencia.
          </p>

        </div>

        <Badge variant="primary">
          Paso {currentStep} de {totalSteps}
        </Badge>

      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Progreso de configuración académica"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
      >

        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
};

export default AcademicProgress;
