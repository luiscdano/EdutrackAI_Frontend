const SubjectFilters = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Filtros
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <select
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          <option>Materia</option>
        </select>

        <select
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          <option>Estado</option>
        </select>

        <select
          className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          <option>Período</option>
        </select>
      </div>
    </div>
  );
};
export default SubjectFilters;