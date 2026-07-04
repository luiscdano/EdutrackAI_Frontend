import {
  useEffect,
  useState,
} from "react";

import AcademicWizard from "../../components/academic/AcademicWizard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Loader from "../../components/ui/Loader";
import type { AcademicSettings } from "../../types/academic.types";

interface AcademicSetupProps {
  initialData?: AcademicSettings | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSubmit?: (
    data: AcademicSettings,
  ) => void | Promise<void>;
  onContinueToDashboard?: () => void;
}

const AcademicSetup = ({
  initialData = null,
  loading = false,
  error = null,
  onRetry,
  onSubmit,
  onContinueToDashboard,
}: AcademicSetupProps) => {
  const [hasStarted, setHasStarted] = useState(
    Boolean(initialData),
  );

  useEffect(() => {
    if (initialData) {
      setHasStarted(true);
    }
  }, [initialData]);

  const continueToDashboard = () => {
    if (onContinueToDashboard) {
      onContinueToDashboard();
      return;
    }

    window.location.assign("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
        <Loader
          size="lg"
          showLabel
          label="Cargando configuración académica..."
        />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8">
        <div className="w-full max-w-xl">
          <ErrorState
            title="No fue posible cargar la configuración"
            description={error}
            icon="!"
            action={
              onRetry ? (
                <Button onClick={onRetry}>
                  Reintentar
                </Button>
              ) : undefined
            }
          />
        </div>
      </main>
    );
  }

  if (!hasStarted && !initialData) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
          <Card>
            <EmptyState
              title="Configura tu perfil académico"
              description="Completa tu información académica para preparar una experiencia de estudio personalizada."
              icon="i"
              action={
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => setHasStarted(true)}
                >
                  Comenzar configuración
                </Button>
              }
            />
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Perfil del estudiante
          </p>

          <h1 className="mt-2 text-2xl font-bold text-content sm:text-3xl">
            {initialData
              ? "Actualizar configuración académica"
              : "Configuración académica inicial"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Estos datos permiten adaptar metas, horarios y recomendaciones de
            estudio a tu contexto actual.
          </p>
        </div>

        <AcademicWizard
          initialData={initialData}
          onSubmit={onSubmit}
          onContinueToDashboard={continueToDashboard}
        />
      </div>
    </main>
  );
};

export default AcademicSetup;
