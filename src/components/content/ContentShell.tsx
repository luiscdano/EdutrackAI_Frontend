import type { ReactNode } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Loader from "../ui/Loader";

interface Props {
  title: string;
  description: string;
  onBack: () => void;
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
      <main className="flex min-h-screen items-center justify-center bg-app-bg">
        <Loader size="lg" showLabel label={`Cargando ${title.toLowerCase()}...`} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4">
        <Card padding="lg" className="w-full max-w-xl text-center">
          <h1 className="text-2xl font-bold text-content">No fue posible cargar la información</h1>
          <p className="mt-3 text-muted">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
            <Button variant="outline" onClick={onBack}>Volver</Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
            <h1 className="mt-4 text-3xl font-bold text-content">{title}</h1>
            <p className="mt-2 max-w-3xl text-muted">{description}</p>
          </div>
          {actions}
        </header>
        {children}
      </div>
    </main>
  );
};

export default ContentShell;
