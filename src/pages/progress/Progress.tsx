import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getAdaptiveOverview } from "../../services/adaptive.service";
import { getCopilotPulse } from "../../services/copilot.service";
import { getGrades } from "../../services/content.service";
import { getMyQuizAttempts } from "../../services/quiz.service";
import type { AdaptiveOverview } from "../../types/adaptive.types";
import type { CopilotPulse } from "../../types/copilot.types";
import type { AcademicGrade } from "../../types/content.types";
import type { QuizAttemptSummary } from "../../types/quiz.types";

interface Props { onBack: () => void }

const scoreOf = (grade: AcademicGrade) => Number(grade.gradeValue) || 0;
const quizScoreOf = (attempt: QuizAttemptSummary) => Number(attempt.score) || 0;
const averageOf = (items: AcademicGrade[]) => items.length
  ? items.reduce((sum, item) => sum + scoreOf(item), 0) / items.length
  : 0;
const quizAverageOf = (items: QuizAttemptSummary[]) => items.length
  ? items.reduce((sum, item) => sum + quizScoreOf(item), 0) / items.length
  : 0;

const trendOf = (items: AcademicGrade[]) => {
  const ordered = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (ordered.length < 2) return "Empezando";
  const recent = averageOf(ordered.slice(0, Math.min(3, ordered.length)));
  const previousItems = ordered.slice(3, 6);
  const previous = previousItems.length ? averageOf(previousItems) : scoreOf(ordered[ordered.length - 1]);
  const delta = recent - previous;
  if (delta > 2) return "Mejorando";
  if (delta < -2) return "Necesita un empujón";
  return "Estable";
};

const statusOf = (level?: string) => {
  if (level === "high") return "Necesita refuerzo";
  if (level === "attention") return "Ponle atención";
  if (level === "watch") return "En camino";
  return "Va bien";
};

const formatDate = (value: string) => new Intl.DateTimeFormat("es-DO", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(value));

const Progress = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "all";
  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [overview, setOverview] = useState<AdaptiveOverview | null>(null);
  const [pulse, setPulse] = useState<CopilotPulse | null>(null);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextGrades, nextAttempts, nextOverview, nextPulse] = await Promise.all([
        getGrades(),
        getMyQuizAttempts(),
        getAdaptiveOverview().catch(() => null),
        getCopilotPulse().catch(() => null),
      ]);
      setGrades(nextGrades);
      setAttempts(nextAttempts.filter((attempt) => attempt.isFinished));
      setOverview(nextOverview);
      setPulse(nextPulse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pude cargar tu progreso.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const summaries = useMemo(() => {
    const activeSubjects = pulse?.activeSubjects ?? [];
    return activeSubjects.map((assignment) => {
      const subjectGrades = grades.filter((grade) => grade.subject.id === assignment.subject.id);
      const subjectAttempts = attempts.filter((attempt) => attempt.quizzies.subject?.id === assignment.subject.id);
      const latest = [...subjectGrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
      const risk = overview?.risks.find((item) => item.subjectId === assignment.subject.id);
      return {
        id: assignment.subject.id,
        name: assignment.subject.name,
        grades: subjectGrades,
        attempts: subjectAttempts,
        average: averageOf(subjectGrades),
        practiceAverage: quizAverageOf(subjectAttempts),
        latest,
        trend: trendOf(subjectGrades),
        status: statusOf(risk?.level),
      };
    });
  }, [attempts, grades, overview, pulse]);

  const selected = subjectId === "all"
    ? null
    : summaries.find((item) => item.id === subjectId) ?? null;
  const overallAverage = grades.length ? averageOf(grades) : 0;
  const overallPracticeAverage = attempts.length ? quizAverageOf(attempts) : 0;
  const recentAttempts = [...attempts]
    .sort((a, b) => new Date(b.finishedAt ?? b.startedAt).getTime() - new Date(a.finishedAt ?? a.startedAt).getTime())
    .slice(0, 6);

  return (
    <ContentShell
      title="Progreso"
      description="Tus notas, prácticas y tiempo de estudio en un solo lugar."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button onClick={() => navigate("/practice")}>Practicar</Button>}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md">
          <span className="text-xs text-muted">Promedio registrado</span>
          <strong className="mt-2 block text-3xl tracking-[-0.04em] text-content">{grades.length ? `${overallAverage.toFixed(1)}%` : "—"}</strong>
          <span className="mt-1 block text-xs text-muted">{grades.length ? `${grades.length} calificaciones` : "Cuando tengas notas aparecerán aquí"}</span>
        </Card>
        <Card padding="md">
          <span className="text-xs text-muted">Tiempo esta semana</span>
          <strong className="mt-2 block text-3xl tracking-[-0.04em] text-content">{pulse?.week.studyMinutes ?? 0} min</strong>
          <span className="mt-1 block text-xs text-muted">{pulse?.week.studySessions ?? 0} sesiones</span>
        </Card>
        <Card padding="md">
          <span className="text-xs text-muted">Prácticas completadas</span>
          <strong className="mt-2 block text-3xl tracking-[-0.04em] text-content">{attempts.length}</strong>
          <span className="mt-1 block text-xs text-muted">{attempts.length ? `${overallPracticeAverage.toFixed(0)}% promedio en quizzes` : "Completa un quiz para medir tu práctica"}</span>
        </Card>
        <Card padding="md">
          <span className="text-xs text-muted">Constancia</span>
          <strong className="mt-2 block text-3xl tracking-[-0.04em] text-content">{pulse?.week.streakDays ?? 0} días</strong>
          <span className="mt-1 block text-xs text-muted">Racha actual</span>
        </Card>
      </section>

      {pulse?.action && (
        <Card padding="lg" className="border-primary/25 bg-primary/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="prototype-eyebrow">Dónde pondría el esfuerzo ahora</span>
              <h2 className="mt-1 text-xl font-bold text-content">{pulse.action.subjectName}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{pulse.message}</p>
            </div>
            <Button onClick={() => navigate(`/focus/${pulse.action?.activityId}`)}>{pulse.action.label}</Button>
          </div>
        </Card>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Resultados de práctica</span>
            <h2 className="mt-1 text-xl font-bold text-content">Tus quizzes recientes</h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate("/practice")}>Hacer otro quiz</Button>
        </div>

        {recentAttempts.length === 0 ? (
          <Card padding="lg" className="text-center">
            <h3 className="text-lg font-bold text-content">Todavía no hay resultados de quizzes</h3>
            <p className="mt-2 text-sm text-muted">Cuando completes uno, aquí verás la calificación, aciertos, materia y fecha.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentAttempts.map((attempt) => (
              <Card key={attempt.id} padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-primary">{attempt.quizzies.subject?.name ?? "Práctica"}</span>
                    <h3 className="mt-1 font-bold text-content">{attempt.quizzies.title}</h3>
                  </div>
                  <strong className="text-2xl text-content">{quizScoreOf(attempt).toFixed(0)}%</strong>
                </div>
                <p className="mt-3 text-sm text-muted">{attempt.correctAnswers} correctas de {attempt.totalQuestion}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(attempt.finishedAt ?? attempt.startedAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Por materia</span>
            <h2 className="mt-1 text-xl font-bold text-content">Lo que realmente necesitas saber</h2>
          </div>
          {selected && <button type="button" onClick={() => setSubjectId("all")} className="text-sm font-semibold text-primary">Ver todas</button>}
        </div>

        {!selected ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary) => (
              <button key={summary.id} type="button" onClick={() => setSubjectId(summary.id)} className="text-left">
                <Card padding="md" className="h-full transition hover:-translate-y-0.5 hover:border-primary/30">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-content">{summary.name}</h3>
                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] font-semibold text-muted">{summary.status}</span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted">Notas</span>
                      <strong className="mt-1 block text-lg text-content">{summary.grades.length ? `${summary.average.toFixed(0)}%` : "—"}</strong>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted">Quizzes</span>
                      <strong className="mt-1 block text-lg text-content">{summary.attempts.length ? `${summary.practiceAverage.toFixed(0)}%` : "—"}</strong>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted">Tendencia</span>
                      <strong className="mt-1 block text-xs text-content">{summary.trend}</strong>
                    </div>
                  </div>
                  <span className="mt-4 block text-xs font-semibold text-primary">Ver detalle →</span>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
            <Card padding="lg">
              <span className="prototype-eyebrow">{selected.status}</span>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-content">{selected.name}</h2>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-surface-muted p-3">
                  <span className="text-xs text-muted">Notas</span>
                  <strong className="mt-1 block text-xl text-content">{selected.grades.length ? `${selected.average.toFixed(1)}%` : "—"}</strong>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <span className="text-xs text-muted">Quizzes</span>
                  <strong className="mt-1 block text-xl text-content">{selected.attempts.length ? `${selected.practiceAverage.toFixed(1)}%` : "—"}</strong>
                </div>
                <div className="rounded-xl bg-surface-muted p-3">
                  <span className="text-xs text-muted">Tendencia</span>
                  <strong className="mt-1 block text-sm text-content">{selected.trend}</strong>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">{selected.attempts.length ? `${selected.attempts.length} quiz(zes) completado(s) en esta materia.` : "Aún no has completado quizzes de esta materia."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => navigate("/practice")}>Practicar</Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/resources?subject=${selected.id}`)}>Recursos</Button>
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="text-lg font-bold text-content">Tus calificaciones</h3>
              {selected.grades.length === 0 ? (
                <p className="mt-3 text-sm text-muted">Todavía no hay calificaciones registradas para esta materia.</p>
              ) : (
                <div className="mt-4 divide-y divide-border">
                  {[...selected.grades]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div>
                          <strong className="block text-sm text-content">{grade.description}</strong>
                          <span className="mt-1 block text-xs text-muted">{grade.gradeType} · {formatDate(grade.date)}</span>
                        </div>
                        <strong className="text-xl text-content">{scoreOf(grade).toFixed(1)}%</strong>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </section>
    </ContentShell>
  );
};

export default Progress;
