import DashboardHeader from "../../components/dashboard/DashboardHeader";
import NotificationsCard from "../../components/dashboard/NotificationsCard";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import QuickActions from "../../components/dashboard/QuickActions";
import StreakCard from "../../components/dashboard/StreakCard";
import StudySessionsChart from "../../components/dashboard/StudySessionsChart";
import SummarySection from "../../components/dashboard/SummarySection";

const Dashboard = () => {
  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <DashboardHeader />

        <SummarySection />

        <section className="grid gap-6 xl:grid-cols-2">
          <StudySessionsChart />
          <PerformanceChart />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <NotificationsCard />
          <StreakCard />
        </section>

        <QuickActions />
      </div>
    </main>
  );
};

export default Dashboard;