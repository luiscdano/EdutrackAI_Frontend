import Card from "../ui/Card";

import type { StudySession } from "../../types/study-session.types";

interface ActivitySummaryProps {
  sessions: StudySession[];
}

const ActivitySummary = ({ sessions }: ActivitySummaryProps) => {
  const totalMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  const averageProductivity = sessions.length
    ? sessions.reduce(
        (total, session) => total + session.productivityRating,
        0,
      ) / sessions.length
    : 0;

  const summaryItems = [
    {
      title: "Tiempo estudiado",
      value: `${Math.floor(totalMinutes / 60)} h ${totalMinutes % 60} min`,
      description: "Tiempo acumulado",
    },
    {
      title: "Productividad",
      value: averageProductivity
        ? `${averageProductivity.toFixed(1)} / 5`
        : "0 / 5",
      description: "Promedio general",
    },
    {
      title: "Actividades",
      value: sessions.length,
      description: "Sesiones registradas",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryItems.map((item) => (
        <Card key={item.title} padding="md">
          <h3 className="text-sm font-medium text-muted">
            {item.title}
          </h3>
          <p className="mt-2 text-3xl font-bold text-content">
            {item.value}
          </p>
          <p className="mt-1 text-sm text-muted">
            {item.description}
          </p>
        </Card>
      ))}
    </section>
  );
};

export default ActivitySummary;
