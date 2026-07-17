import RelatedActions from "../../components/subjects/RelatedActions";
import SearchBar from "../../components/subjects/SearchBar";
import SubjectDetail from "../../components/subjects/SubjectDetail";
import SubjectFilters from "../../components/subjects/SubjectFilters";
import SubjectsGrid from "../../components/subjects/SubjectsGrid";
import SubjectsHeader from "../../components/subjects/SubjectsHeader";

const Subjects = () => {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <SubjectsHeader />

        <SearchBar />

        <SubjectFilters />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SubjectsGrid />
          </div>

          <SubjectDetail />
        </div>

        <RelatedActions />
      </div>
    </div>
  );
};

export default Subjects;