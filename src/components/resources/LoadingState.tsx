const LoadingState = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-600"></div>

        <p className="text-slate-400">
          Cargando recursos...
        </p>
      </div>
    </div>
  );
};

export default LoadingState;