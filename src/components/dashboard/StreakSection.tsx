import Card from "../ui/Card";
import type { DashboardStreak } from "../../types/dashboard.types";

interface Props {
  streak: DashboardStreak;
}

const StreakSection = ({ streak }: Props) => (
  <Card padding="md">
    <h2 className="text-xl font-bold text-content">Constancia de estudio</h2>
    <div className="mt-5 space-y-4">
      <div className="rounded-control border border-border bg-surface-muted p-4">
        <p className="text-sm text-muted">Racha actual</p>
        <p className="mt-1 text-3xl font-bold text-content">{streak.currentStreak} días</p>
      </div>
      <div className="rounded-control border border-border bg-surface-muted p-4">
        <p className="text-sm text-muted">Mejor racha</p>
        <p className="mt-1 text-3xl font-bold text-content">{streak.longestStreak} días</p>
      </div>
      <div className="rounded-control border border-border bg-surface-muted p-4">
        <p className="text-sm text-muted">Días activos este mes</p>
        <p className="mt-1 text-3xl font-bold text-content">{streak.activeDaysLast30}</p>
      </div>
    </div>
  </Card>
);

export default StreakSection;
