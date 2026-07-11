const AvatarCard = () => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 text-4xl font-bold text-slate-500">
          ?
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          Información no disponible
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Los datos del usuario aparecerán cuando la API esté disponible.
        </p>
      </div>
    </div>
  );
};

export default AvatarCard;