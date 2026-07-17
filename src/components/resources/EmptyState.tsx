const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white">
          No hay recursos disponibles
        </h2>

        <p className="mt-3 text-slate-400">
          No se encontraron recursos para mostrar.
        </p>
      </div>
    </div>
  );
};

export default EmptyState;