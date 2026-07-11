const ProfileInfo = () => {
  const fields = [
    { label: "Nombre", value: "—" },
    { label: "Matrícula", value: "—" },
    { label: "Carrera", value: "—" },
    { label: "Correo", value: "—" },
    { label: "Rol", value: "—" },
  ];

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Información de la cuenta
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-2">
            <label className="text-sm font-medium text-slate-400">
              {field.label}
            </label>

            <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileInfo;