const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">
      <h2 className="text-xl font-semibold text-white">
        Sin información
      </h2>

      <p className="mt-2 text-slate-400">
        Aún no hay datos disponibles para este usuario.
      </p>
    </div>
  );
};

export default EmptyState;