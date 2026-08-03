import { Link, useRouteError } from "react-router-dom";

import Card from "../../components/ui/Card";

interface StatusPageProps {
  code: string;
  title: string;
  message: string;
}

export const StatusPage = ({ code, title, message }: StatusPageProps) => (
  <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10">
    <Card padding="lg" className="w-full max-w-xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Error {code}</p>
      <h1 className="mt-4 text-3xl font-bold text-content sm:text-4xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">{message}</p>
      <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Volver al inicio</Link>
    </Card>
  </main>
);

export const ForbiddenPage = () => <StatusPage code="403" title="Acceso restringido" message="Tu cuenta no tiene permisos para abrir esta sección. Regresa a un módulo autorizado." />;
export const NotFoundPage = () => <StatusPage code="404" title="Página no encontrada" message="La dirección no existe o fue movida. Utiliza la navegación principal para continuar." />;

export const RouteErrorPage = () => {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "La aplicación encontró un error inesperado.";
  return <StatusPage code="500" title="No fue posible mostrar esta pantalla" message={message} />;
};
