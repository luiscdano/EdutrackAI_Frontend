import Card from "../ui/Card";
import type { DashboardPerformanceItem } from "../../types/dashboard.types";

interface Props {
  items: DashboardPerformanceItem[];
}

const PerformanceSection = ({ items }: Props) => (
  <Card padding="md" className="lg:col-span-2">
    <h2 className="text-xl font-bold text-content">Rendimiento por materia</h2>
    <p className="mt-1 text-sm text-muted">Promedio y tiempo de estudio acumulado.</p>

    {items.length === 0 ? (
      <p className="mt-5 rounded-control border border-dashed border-border p-8 text-center text-muted">
        No hay materias inscritas todavía.
      </p>
    ) : (
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <article key={item.subject.id} className="rounded-control border border-border bg-surface-muted p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <div>
                <h3 className="font-semibold text-content">{item.subject.name}</h3>
                <p className="text-sm text-muted">Nivel: {item.subject.level}</p>
              </div>
              <div className="text-sm text-muted sm:text-right">
                <p>{item.grades.average.toFixed(1)}% de promedio</p>
                <p>{item.studySessions.count} sesiones · {item.studySessions.totalMinutes} min</p>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-bg">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, item.grades.average))}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    )}
  </Card>
);

export default PerformanceSection;
