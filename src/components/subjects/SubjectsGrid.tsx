const SubjectsGrid = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Materias disponibles
      </h2>

      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">
            No hay materias disponibles
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Las materias aparecerán aquí cuando la información esté disponible.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubjectsGrid;