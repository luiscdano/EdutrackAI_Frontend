const actions = [
  "Calificaciones",
  "Sesiones",
  "Recursos",
  "Quizzes",
];

const RelatedActions = () => {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Acciones relacionadas
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action}
            disabled
            className="rounded-xl border border-slate-700 bg-slate-950 px-6 py-5 text-center text-white transition opacity-50 cursor-not-allowed"
          >
            {action}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-slate-400">
        Estas acciones estarán disponibles cuando la navegación y la API se
        encuentren integradas.
      </p>
    </section>
  );
};

export default RelatedActions;