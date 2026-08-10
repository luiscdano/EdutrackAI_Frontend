import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getAdaptiveOverview,
  getUpcomingEvaluations,
  regenerateStudyPlan,
  updateStudyPlanActivity,
} from "../../services/adaptive.service";
import { getQuizzes, startQuizAttempt } from "../../services/quiz.service";
import type {
  AdaptiveOverview,
  EvaluationSummary,
  StudyPlanActivity,
} from "../../types/adaptive.types";
import type { QuizSummary } from "../../types/quiz.types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-DO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const riskLabel = (level: StudyPlanActivity["priorityLevel"]) => {
  if (level === "high") return "Prioridad alta";
  if (level === "attention") return "Necesita atención";
  if (level === "watch") return "En observación";
  return "Estable";
};

const activityLabel = (type: string) => {
  const labels: Record<string, string> = {
    exam_preparation: "Preparación de evaluación",
    quiz_review: "Repaso con práctica",
    topic_review: "Repaso de tema",
    study_session: "Sesión de estudio",
  };
  return labels[type] ?? "Actividad guiada";
};

const componentLabel = (key: string) => {
  const labels: Record<string, string> = {
    performance: "Rendimiento",
    evaluationUrgency: "Evaluación",
    inactivity: "Inactividad",
    recentQuiz: "Quiz reciente",
    difficulty: "Dificultad",
  };
  return labels[key] ?? key;
};

const StudyPlan = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlanActivity[]>([]);
  const [overview, setOverview] = useState<AdaptiveOverview | null>(null);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (regenerate = true) => {
    setError(null);
    if (regenerate) setRefreshing(true);

    try {
      const nextPlan = regenerate ? await regenerateStudyPlan() : null;
      const [nextOverview, nextQuizzes, nextEvaluations] = await Promise.all([
        getAdaptiveOverview(),
        getQuizzes(),
        getUpcomingEvaluations(),
      ]);

      setPlan(nextPlan ?? nextOverview.plan);
      setOverview(nextOverview);
      setQuizzes(nextQuizzes.filter((quiz) => quiz.isActive));
      setEvaluations(nextEvaluations);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible construir tu plan de estudio.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(true), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const priority = overview?.priority ?? null;
  const sortedPlan = useMemo(
    () => [...plan].sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
    }),
    [plan],
  );

  const updateActivity = async (
    activity: StudyPlanActivity,
    payload: Parameters<typeof updateStudyPlanActivity>[1],
    refreshAfter = false,
  ) => {
    if (workingId) return;
    setWorkingId(activity.id);

    try {
      const updated = await updateStudyPlanActivity(activity.id, payload);
      setPlan((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (refreshAfter) await load(true);
    } catch (operationError) {
      window.alert(
        operationError instanceof Error
          ? operationError.message
          : "No fue posible actualizar la actividad.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  const startActivity = async (activity: StudyPlanActivity) => {
    if (workingId) return;
    setWorkingId(activity.id);

    try {
      const updated = await updateStudyPlanActivity(activity.id, { status: "in_progress" });
      setPlan((current) => current.map((item) => (item.id === updated.id ? updated : item)));

      const subjectQuiz = quizzes.find((quiz) => quiz.subject.id === activity.subject.id);
      if (activity.activityType === "quiz_review" && subjectQuiz) {
        const attempt = await startQuizAttempt(subjectQuiz.id);
        navigate(`/quizzes/attempts/${attempt.id}`);
        return;
      }

      navigate(`/study-sessions?planActivityId=${encodeURIComponent(activity.id)}`);
    } catch (operationError) {
      window.alert(
        operationError instanceof Error
          ? operationError.message
          : "No fue posible comenzar la actividad.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  const moveOneDay = (activity: StudyPlanActivity) => {
    const nextDate = new Date(activity.scheduledFor);
    nextDate.setDate(nextDate.getDate() + 1);
    void updateActivity(activity, { scheduledFor: nextDate.toISOString() });
  };

  const changeDuration = (activity: StudyPlanActivity, delta: number) => {
    const nextDuration = Math.min(180, Math.max(10, activity.durationMinutes + delta));
    void updateActivity(activity, { durationMinutes: nextDuration });
  };

  if (loading) {
    return (
      <ContentShell
        title="Mi plan"
        description="EduTrack está analizando tus datos recientes para decidir qué conviene hacer primero."
        loading
      >
        <div />
      </ContentShell>
    );
  }

  return (
    <ContentShell
      title="Mi plan"
      description="Un plan vivo que se reajusta según tus notas, quizzes, sesiones de estudio y evaluaciones próximas."
      error={error}
      onRetry={() => void load(true)}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/quizzes")}>Explorar prácticas</Button>
          <Button loading={refreshing} onClick={() => void load(true)}>Recalcular plan</Button>
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <Card padding="lg" className="prototype-priority">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">Motor adaptativo</span>
              <h2 className="mt-1 text-xl font-bold text-content">Tu prioridad actual</h2>
            </div>
            {priority && (
              <span className="prototype-badge prototype-badge-attention">
                Riesgo {priority.score}/100
              </span>
            )}
          </div>

          {priority ? (
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="text-2xl font-bold tracking-[-0.025em] text-content">
                {priority.subject.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="prototype-badge">{riskLabel(priority.level)}</span>
                <span className="rounded-lg bg-surface-muted px-2.5 py-1.5 text-xs text-muted">
                  Último análisis: {formatDate(priority.evaluatedAt)}
                </span>
              </div>
              <div className="mt-4 grid gap-2">
                {priority.reasons.map((reason) => (
                  <p key={reason} className="text-sm leading-6 text-muted">{reason}</p>
                ))}
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-5">
                {Object.entries(priority.components).map(([key, value]) => (
                  <div key={key} className="rounded-xl bg-surface-muted p-3">
                    <span className="block text-[10px] uppercase tracking-[0.08em] text-muted">{componentLabel(key)}</span>
                    <strong className="mt-1 block text-lg text-content">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted">
              Todavía no hay suficiente información para calcular una prioridad. Al registrar notas, quizzes o sesiones, el motor comenzará a construirla.
            </p>
          )}
        </Card>

        <Card padding="md">
          <span className="prototype-eyebrow">Próximas fechas</span>
          <h2 className="mt-1 text-lg font-bold text-content">Evaluaciones</h2>
          <div className="mt-4 grid gap-2.5">
            {evaluations.length === 0 ? (
              <p className="text-sm leading-6 text-muted">No hay evaluaciones próximas registradas.</p>
            ) : (
              evaluations.slice(0, 5).map((evaluation) => (
                <div key={evaluation.id} className="rounded-xl bg-surface-muted p-3">
                  <strong className="block text-sm text-content">{evaluation.title}</strong>
                  <span className="mt-1 block text-xs text-muted">{evaluation.subject.name}</span>
                  <span className="mt-2 block text-xs font-semibold text-primary">{formatDate(evaluation.scheduledAt)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Ruta sugerida</span>
            <h2 className="mt-1 text-xl font-bold text-content">Actividades generadas para ti</h2>
            <p className="mt-1 text-sm text-muted">Puedes comenzar, mover, ajustar la duración, completar o descartar una actividad.</p>
          </div>
          <span className="prototype-badge">{sortedPlan.length} pendientes</span>
        </div>

        {sortedPlan.length === 0 ? (
          <Card padding="lg" className="text-center">
            <h3 className="text-xl font-bold text-content">No tienes una actividad prioritaria pendiente</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
              Esto puede significar que tu estado es estable o que aún faltan datos académicos. El plan volverá a evaluarse cuando ocurra un evento relevante y también de forma periódica.
            </p>
            <Button className="mt-5" loading={refreshing} onClick={() => void load(true)}>Analizar ahora</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedPlan.map((activity, index) => (
              <Card key={activity.id} padding="md" className={index === 0 ? "border-primary/35" : ""}>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="prototype-badge">{activity.subject.name}</span>
                      <span className={activity.priorityLevel === "high" ? "prototype-badge prototype-badge-attention" : "prototype-badge"}>
                        {riskLabel(activity.priorityLevel)} · {activity.priorityScore}/100
                      </span>
                      <span className="rounded-full bg-surface-muted px-3 py-1 text-[10px] font-semibold text-muted">
                        {activityLabel(activity.activityType)}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-content">{activity.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{activity.reason}</p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-lg bg-surface-muted px-3 py-2 text-muted">{formatDate(activity.scheduledFor)}</span>
                      <span className="rounded-lg bg-surface-muted px-3 py-2 text-muted">{activity.durationMinutes} min</span>
                      {activity.topic && <span className="rounded-lg bg-surface-muted px-3 py-2 text-muted">Tema: {activity.topic}</span>}
                      {activity.evaluation && <span className="rounded-lg bg-surface-muted px-3 py-2 text-muted">Para: {activity.evaluation.title}</span>}
                    </div>

                    {activity.recommendation?.resource && (
                      <div className="mt-4 rounded-xl border border-border bg-surface-muted/50 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Recurso sugerido</span>
                        <strong className="mt-1 block text-sm text-content">{activity.recommendation.resource.title}</strong>
                        <p className="mt-1 text-xs text-muted">El recurso aparecerá también dentro de la sesión guiada.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[250px] lg:justify-end">
                    <Button size="sm" loading={workingId === activity.id} onClick={() => void startActivity(activity)}>
                      {activity.status === "in_progress" ? "Continuar" : "Comenzar"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={Boolean(workingId)} onClick={() => void updateActivity(activity, { status: "completed" }, true)}>Completar</Button>
                    <Button size="sm" variant="secondary" disabled={Boolean(workingId)} onClick={() => moveOneDay(activity)}>Mover +1 día</Button>
                    <Button size="sm" variant="ghost" disabled={Boolean(workingId) || activity.durationMinutes <= 10} onClick={() => changeDuration(activity, -10)}>−10 min</Button>
                    <Button size="sm" variant="ghost" disabled={Boolean(workingId) || activity.durationMinutes >= 180} onClick={() => changeDuration(activity, 10)}>+10 min</Button>
                    <Button size="sm" variant="ghost" disabled={Boolean(workingId)} onClick={() => void updateActivity(activity, { status: "skipped" }, true)}>No necesito este repaso</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </ContentShell>
  );
};

export default StudyPlan;
