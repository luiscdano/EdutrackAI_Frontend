import StatsCard from "./StatsCard";

import type { DashboardSummary } from "../../types/dashboard.types";

interface Props {
  summary: DashboardSummary;
}

const SummarySection = ({ summary }: Props) => {
  const items = [
    {
      title: "Materias inscritas",
      value: summary.enrolledSubjects,
      subtitle: "Materias activas",
    },
    {
      title: "Sesiones esta semana",
      value: summary.studySessionsLast7Days,
      subtitle: "Últimos 7 días",
    },
    {
      title: "Minutos estudiados",
      value: summary.totalStudyMinutesLast7Days,
      subtitle: "Últimos 7 días",
    },
    {
      title: "Productividad",
      value: `${summary.averageProductivity.toFixed(1)} / 5`,
      subtitle: "Promedio de sesiones",
    },
    {
      title: "Intentos de quizzes",
      value: summary.quizAttemptsLast7Days,
      subtitle: "Últimos 7 días",
    },
    {
      title: "Promedio de quizzes",
      value: `${summary.averageQuizScore.toFixed(1)}%`,
      subtitle: "Últimos 7 días",
    },
    {
      title: "Notificaciones",
      value: summary.unreadNotifications,
      subtitle: "Sin leer",
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-content">
        Resumen académico
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <StatsCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
};

export default SummarySection;
