const SubjectDetail = () => {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Detalle
      </h2>

      <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white">
            Ninguna materia seleccionada
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Selecciona una materia para visualizar su información.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SubjectDetail;