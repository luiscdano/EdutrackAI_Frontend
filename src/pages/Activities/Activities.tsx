import ActivitiesHeader from "../../components/activities/ActivitiesHeader";
import ActivitySummary from "../../components/activities/ActivitySummary";
import ActivityFilters from "../../components/activities/ActivityFilters";
import ActivityList from "../../components/activities/ActivityList";

const Activities = () => {
  return (
    <main className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Header */}
        <ActivitiesHeader />

        {/* Resumen */}
        <ActivitySummary />

        {/* Filtros */}
        <ActivityFilters />

        {/* Lista / tabla */}
        <ActivityList />
      </div>
    </main>
  );
};

export default Activities;