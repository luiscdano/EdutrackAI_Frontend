import ResourceDetail from "../../components/resources/ResourceDetail";
import ResourceFilters from "../../components/resources/ResourceFilters";
import ResourcesGrid from "../../components/resources/ResourcesGrid";
import ResourcesHeader from "../../components/resources/ResourcesHeader";
import SearchBar from "../../components/resources/SearchBar";

const Resources = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <ResourcesHeader />

        <SearchBar />

        <ResourceFilters />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ResourcesGrid />
          </div>

          <ResourceDetail />
        </div>
      </div>
    </div>
  );
};

export default Resources;