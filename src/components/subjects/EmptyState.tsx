const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">
          No hay materias disponibles
        </h2>

        <p className="mt-3 text-slate-400">
          Cuando existan materias registradas aparecerán aquí.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;