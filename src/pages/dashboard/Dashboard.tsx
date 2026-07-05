import DashboardHeader from "../../components/dashboard/DashboardHeader";
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
  onOpenAcademicProfile: () => void;
  onOpenStudySessions: () => void;
  onLogout: () => void;
}

const Dashboard = (props: Props) => {
  const { data, loading, error, load } = useDashboardData();

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-app-bg"><Loader size="lg" showLabel label="Cargando dashboard..." /></main>;
  }

  if (error || !data) {
    return <main className="flex min-h-screen items-center justify-center bg-app-bg px-4"><Card className="max-w-lg text-center"><h1 className="text-2xl font-bold text-content">No fue posible cargar el dashboard</h1><p className="mt-3 text-muted">{error}</p><Button className="mt-5" onClick={() => void load()}>Reintentar</Button></Card></main>;
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardHeader firstName={props.firstName} onOpenProfile={props.onOpenAcademicProfile} onLogout={props.onLogout} />
        <SummarySection summary={data.summary} />
        <section className="grid gap-6 lg:grid-cols-3">
          <PerformanceSection items={data.performance} />
          <StreakSection streak={data.streak} />
        </section>
        <QuickActions onOpenAcademicProfile={props.onOpenAcademicProfile} onOpenStudySessions={props.onOpenStudySessions} onRefresh={() => void load()} />
      </div>
    </main>
  );
};

export default Dashboard;
