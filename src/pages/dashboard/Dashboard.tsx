import PerformanceSection from "../../components/dashboard/PerformanceSection";
import QuickActions from "../../components/dashboard/QuickActions";
import StreakSection from "../../components/dashboard/StreakSection";
import SummarySection from "../../components/dashboard/SummarySection";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useDashboardData } from "../../hooks/useDashboardData";

interface Props {
  firstName: string;
  onOpenAccount: () => void;
  onOpenSubjects: () => void;
  onOpenProgress: () => void;
  onOpenResources: () => void;
  onOpenRecommendations: () => void;
  onOpenNotifications: () => void;
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onOpenPractices: () => void;
}

const Dashboard = (props: Props) => {
  const { data, loading, error, load } = useDashboardData();

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center"><Loader size="lg" showLabel label="Cargando dashboard..." /></div>;
  }

  if (error || !data) {
    return <div className="flex min-h-[55vh] items-center justify-center"><Card className="max-w-lg text-center"><h2 className="text-2xl font-bold text-content">No fue posible cargar el dashboard</h2><p className="mt-3 text-muted">{error}</p><Button className="mt-5" onClick={() => void load()}>Reintentar</Button></Card></div>;
  }

  return (
    <div className="flex flex-col gap-7">
      <Card padding="md" className="overflow-hidden bg-gradient-to-br from-primary/20 via-surface to-surface">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Resumen académico</p>
            <h2 className="mt-2 text-3xl font-bold text-content">Bienvenida, {props.firstName}</h2>
            <p className="mt-2 max-w-2xl text-muted">Consulta tu rendimiento, mantén tu racha y continúa con una práctica o sesión de estudio.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={props.onOpenPractices}>Realizar práctica</Button>
            <Button variant="outline" onClick={props.onOpenNotifications}>Notificaciones ({data.summary.unreadNotifications})</Button>
          </div>
        </div>
      </Card>
      <SummarySection summary={data.summary} />
      <section className="grid gap-6 lg:grid-cols-3">
        <PerformanceSection items={data.performance} />
        <StreakSection streak={data.streak} />
      </section>
      <QuickActions {...props} onRefresh={() => void load()} />
    </div>
  );
};

export default Dashboard;
