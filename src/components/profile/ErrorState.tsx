const ErrorState = () => {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center">
      <h2 className="text-xl font-semibold text-red-400">
        Ocurrió un error
      </h2>

      <p className="mt-2 text-slate-400">
        No fue posible cargar la información del perfil.
      </p>

      <button
        disabled
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white opacity-50 cursor-not-allowed"
      >
        Reintentar
      </button>
    </div>
  );
};

export default ErrorState;