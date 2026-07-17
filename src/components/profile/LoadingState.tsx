const LoadingState = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-600"></div>

      <p className="mt-4 text-slate-400">
        Cargando información del perfil...
      </p>
    </div>
  );
};

export default LoadingState;