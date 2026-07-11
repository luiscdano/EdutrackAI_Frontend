const EditableFields = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-white">
          Configuración de la cuenta
        </h2>

        <p className="text-sm text-slate-400">
          La edición de la información estará disponible cuando el backend
          habilite la actualización segura de la cuenta.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">
            Nombre
          </label>

          <input
            type="text"
            placeholder="No disponible"
            disabled
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-500 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">
            Correo
          </label>

          <input
            type="email"
            placeholder="No disponible"
            disabled
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-500 outline-none"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          disabled
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white opacity-50 cursor-not-allowed"
        >
          Guardar cambios
        </button>

        <button
          disabled
          className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-400 opacity-50 cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
};

export default EditableFields;