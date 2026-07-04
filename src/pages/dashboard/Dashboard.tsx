import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/dashboard.service";
import type { DashboardData } from "../../types/dashboard.types";

interface Props {
  firstName: string;
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onLogout: () => void;
}

export default function Dashboard(props: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardData().then(setData).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Error al cargar");
    });
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Cargando dashboard...</p>;

  return (
    <main className="min-h-screen bg-app-bg p-6 text-content">
      <h1 className="text-3xl font-bold">Bienvenida, {props.firstName}</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article>Materias: {data.summary.enrolledSubjects}</article>
        <article>Sesiones: {data.summary.studySessionsLast7Days}</article>
        <article>Minutos: {data.summary.totalStudyMinutesLast7Days}</article>
        <article>Productividad: {data.summary.averageProductivity}</article>
      </div>
      <button onClick={props.onOpenStudySessions}>Registrar actividad</button>
      <button onClick={props.onOpenAcademicProfile}>Perfil académico</button>
      <button onClick={props.onLogout}>Cerrar sesión</button>
    </main>
  );
}
