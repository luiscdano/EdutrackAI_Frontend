import type { ReactNode } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Loader from "../ui/Loader";

interface Props {
  title: string;
  description: string;
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}

const ContentShell = ({
  title,
  description,
  onBack,
  loading = false,
  error = null,
  onRetry,
  actions,
  children,
}: Props) => {
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" showLabel label={`Cargando ${title.toLowerCase()}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card padding="lg" className="w-full max-w-xl text-center">
          <span className="prototype-eyebrow">No disponible</span>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-content">
            No fue posible cargar la información
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
            {onBack && <Button variant="secondary" onClick={onBack}>Volver</Button>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <section className="w-full space-y-5">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-primary"
            >
              ← Volver
            </button>
          )}
          <h2 className="text-[clamp(1.45rem,2.5vw,1.9rem)] font-bold leading-tight tracking-[-0.025em] text-content">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
      </header>
      {children}
    </section>
  );
};

export default ContentShell;
