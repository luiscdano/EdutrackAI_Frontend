import Card from "../ui/Card";
import type { DashboardSummary } from "../../types/dashboard.types";

interface Props {
  summary: DashboardSummary;
}

const SummarySection = ({ summary }: Props) => {
  const items = [
    ["Materias inscritas", summary.enrolledSubjects],
    ["Sesiones esta semana", summary.studySessionsLast7Days],
    ["Minutos estudiados", summary.totalStudyMinutesLast7Days],
    ["Productividad", `${summary.averageProductivity.toFixed(1)} / 5`],
    ["Intentos de quizzes", summary.quizAttemptsLast7Days],
    ["Promedio de quizzes", `${summary.averageQuizScore.toFixed(1)}%`],
    ["Notificaciones", summary.unreadNotifications],
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-content">Resumen académico</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <Card key={String(label)} padding="md">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold text-content">{value}</p>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SummarySection;
