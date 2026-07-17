const ResourceCard = () => {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
            Tipo
          </span>

          <span className="text-xs text-green-400">
            Disponible
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white">
          Título del recurso
        </h3>

        <p className="text-sm text-slate-400">
          La información será proporcionada por la API.
        </p>

        <button
          disabled
          className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-white opacity-50 cursor-not-allowed"
        >
          Ver recurso
        </button>
      </div>
    </article>
  );
};

export default ResourceCard;