const ResourceFilters = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Filtros
      </h2>

      <div className="grid gap-4 md:grid-cols-4">
        <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
          <option>Materia</option>
        </select>

        <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
          <option>Tipo</option>
        </select>

        <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
          <option>Dificultad</option>
        </select>

        <select className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
          <option>Tema</option>
        </select>
      </div>
    </section>
  );
};

export default ResourceFilters;