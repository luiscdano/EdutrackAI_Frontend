import { useMemo, useState, type FormEvent } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import type { AdminSubject } from "../../types/adminAcademic.types";
import type {
  EvaluationPayload,
  EvaluationSummary,
} from "../../types/adaptive.types";

interface Props {
  subjects: AdminSubject[];
  evaluations: EvaluationSummary[];
  loading?: boolean;
  onCreate: (payload: EvaluationPayload) => Promise<void>;
  onUpdate: (
    evaluationId: string,
    payload: Partial<Omit<EvaluationPayload, "subjectId">>,
  ) => Promise<void>;
  onDeactivate: (evaluationId: string) => Promise<void>;
}

interface FormState {
  subjectId: string;
  title: string;
  description: string;
  evaluationType: string;
  scheduledAt: string;
  weight: string;
}

const emptyForm: FormState = {
  subjectId: "",
  title: "",
  description: "",
  evaluationType: "exam",
  scheduledAt: "",
  weight: "",
};

const toLocalDateTimeInput = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const EvaluationsManager = ({
  subjects,
  evaluations,
  loading = false,
  onCreate,
  onUpdate,
  onDeactivate,
}: Props) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.status === "active"),
    [subjects],
  );

  const sortedEvaluations = useMemo(
    () =>
      [...evaluations].sort(
        (left, right) =>
          new Date(left.scheduledAt).getTime() -
          new Date(right.scheduledAt).getTime(),
      ),
    [evaluations],
  );

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const edit = (evaluation: EvaluationSummary) => {
    setEditingId(evaluation.id);
    setFeedback(null);
    setForm({
      subjectId: evaluation.subject.id,
      title: evaluation.title,
      description: evaluation.description ?? "",
      evaluationType: evaluation.evaluationType,
      scheduledAt: toLocalDateTimeInput(evaluation.scheduledAt),
      weight:
        evaluation.weight === null || evaluation.weight === undefined
          ? ""
          : String(evaluation.weight),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.subjectId || !form.title.trim() || !form.scheduledAt) {
      setFeedback("Selecciona la materia, escribe el título y define la fecha de la evaluación.");
      return;
    }

    const weight = form.weight === "" ? undefined : Number(form.weight);
    if (weight !== undefined && (!Number.isFinite(weight) || weight < 0 || weight > 100)) {
      setFeedback("El peso debe estar entre 0 y 100.");
      return;
    }

    const scheduledAt = new Date(form.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      setFeedback("La fecha de la evaluación no es válida.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingId) {
        await onUpdate(editingId, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          evaluationType: form.evaluationType,
          scheduledAt: scheduledAt.toISOString(),
          weight,
          isActive: true,
        });
        setFeedback("Evaluación actualizada. El motor adaptativo recalculará los planes afectados.");
      } else {
        await onCreate({
          subjectId: form.subjectId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          evaluationType: form.evaluationType,
          scheduledAt: scheduledAt.toISOString(),
          weight,
          isActive: true,
        });
        setFeedback("Evaluación creada. Los estudiantes asignados serán reevaluados automáticamente.");
      }

      reset();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No fue posible guardar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async (evaluation: EvaluationSummary) => {
    if (!window.confirm(`¿Desactivar “${evaluation.title}”? El motor volverá a calcular los planes de esta materia.`)) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      await onDeactivate(evaluation.id);
      if (editingId === evaluation.id) reset();
      setFeedback("Evaluación desactivada y planes enviados a recalcular.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "No fue posible desactivar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="prototype-eyebrow">Motor adaptativo</span>
          <h2 className="mt-1 text-xl font-bold text-content">Evaluaciones y fechas importantes</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            Estas fechas aumentan o reducen automáticamente la prioridad de una materia. Crear, mover o desactivar una evaluación dispara un nuevo análisis para los estudiantes asignados.
          </p>
        </div>
        <span className="prototype-badge">{sortedEvaluations.filter((item) => item.isActive).length} activas</span>
      </div>

      {feedback && (
        <div className="rounded-xl border border-border bg-surface-muted px-4 py-3 text-sm text-content">
          {feedback}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">{editingId ? "Editar" : "Nueva fecha"}</span>
              <h3 className="mt-1 text-lg font-bold text-content">
                {editingId ? "Actualizar evaluación" : "Registrar evaluación"}
              </h3>
            </div>
            {editingId && (
              <Button size="sm" variant="ghost" onClick={reset} disabled={submitting}>
                Cancelar
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <label className="grid gap-1.5 text-xs font-semibold text-muted">
              Materia
              <select
                value={form.subjectId}
                onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}
                disabled={Boolean(editingId) || submitting}
                className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary"
                required
              >
                <option value="">Selecciona una materia</option>
                {activeSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code} · {subject.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-muted">
              Título
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                disabled={submitting}
                placeholder="Examen parcial, entrega final..."
                className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary"
                required
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-semibold text-muted">
                Tipo
                <select
                  value={form.evaluationType}
                  onChange={(event) => setForm((current) => ({ ...current, evaluationType: event.target.value }))}
                  disabled={submitting}
                  className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary"
                >
                  <option value="exam">Examen</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Asignación</option>
                  <option value="project">Proyecto</option>
                  <option value="presentation">Presentación</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-muted">
                Peso (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.weight}
                  onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))}
                  disabled={submitting}
                  placeholder="Opcional"
                  className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold text-muted">
              Fecha y hora
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                disabled={submitting}
                className="min-h-11 rounded-control border border-border bg-surface px-3 text-sm text-content outline-none focus:border-primary"
                required
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-muted">
              Descripción
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                disabled={submitting}
                rows={3}
                placeholder="Contenido, alcance o indicaciones relevantes."
                className="rounded-control border border-border bg-surface px-3 py-2.5 text-sm text-content outline-none focus:border-primary"
              />
            </label>

            <Button type="submit" loading={submitting} disabled={activeSubjects.length === 0}>
              {editingId ? "Guardar cambios" : "Crear evaluación"}
            </Button>
          </form>
        </Card>

        <Card padding="md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">Calendario académico</span>
              <h3 className="mt-1 text-lg font-bold text-content">Fechas registradas</h3>
            </div>
            {loading && <span className="text-xs text-muted">Actualizando…</span>}
          </div>

          <div className="mt-4 grid gap-2.5">
            {sortedEvaluations.length === 0 ? (
              <div className="rounded-xl bg-surface-muted p-4 text-sm leading-6 text-muted">
                Aún no hay evaluaciones registradas. Sin fechas próximas, el motor solo puede priorizar usando notas, quizzes, inactividad y dificultad.
              </div>
            ) : (
              sortedEvaluations.map((evaluation) => (
                <article
                  key={evaluation.id}
                  className={`rounded-xl border p-3.5 ${evaluation.isActive ? "border-border bg-surface" : "border-border bg-surface-muted opacity-70"}`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="prototype-badge">{evaluation.subject.name}</span>
                        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-muted">
                          {evaluation.evaluationType}
                        </span>
                        {!evaluation.isActive && (
                          <span className="rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-semibold text-danger">
                            Inactiva
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-base font-bold text-content">{evaluation.title}</h4>
                      <p className="mt-1 text-xs font-semibold text-primary">{formatDate(evaluation.scheduledAt)}</p>
                      {evaluation.weight !== null && (
                        <p className="mt-1 text-xs text-muted">Peso: {Number(evaluation.weight)}%</p>
                      )}
                      {evaluation.description && (
                        <p className="mt-2 text-sm leading-5 text-muted">{evaluation.description}</p>
                      )}
                    </div>

                    {evaluation.isActive && (
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => edit(evaluation)} disabled={submitting}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => void deactivate(evaluation)} disabled={submitting}>
                          Desactivar
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default EvaluationsManager;
