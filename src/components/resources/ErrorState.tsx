const ErrorState = () => {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-400">
          Error al cargar los recursos
        </h2>

        <p className="mt-3 text-slate-400">
          No fue posible obtener la información desde el servidor.
        </p>

        <button
          disabled
          className="mt-6 cursor-not-allowed rounded-lg bg-blue-600 px-5 py-3 text-white opacity-50"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};

export default ErrorState;