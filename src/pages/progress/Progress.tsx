import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getAdaptiveHistory, getAdaptiveOverview } from "../../services/adaptive.service";
import { getGrades } from "../../services/content.service";
import type {
  AdaptiveOverview,
  AdaptiveRisk,
  AdaptiveRiskHistoryEntry,
  RiskLevel,
} from "../../types/adaptive.types";
import type { AcademicGrade } from "../../types/content.types";

interface Props { onBack: () => void }

const scoreOf = (grade: AcademicGrade) => Number(grade.gradeValue) || 0;
const formatDate = (value: string) => new Date(value).toLocaleDateString("es-DO");
const formatMoment = (value: string) => new Date(value).toLocaleString("es-DO", {
  day: "2-digit",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

const riskLabel = (level: RiskLevel) => {
  if (level === "high") return "Prioridad alta";
  if (level === "attention") return "Necesita atención";
  if (level === "watch") return "En observación";
  return "Estable";
};

const triggerLabel = (trigger: string) => {
  const labels: Record<string, string> = {
    manual: "Recalculado manualmente",
    daily_scheduler: "Revisión periódica",
    grade_created: "Nueva calificación",
    grade_updated: "Calificación actualizada",
    quiz_finished: "Quiz completado",
    study_session_saved: "Sesión registrada",
    plan_activity_completed: "Actividad completada",
    evaluation_changed: "Evaluación actualizada",
  };
  return labels[trigger] ?? trigger.replaceAll("_", " ");
};

const componentLabel = (key: string) => {
  const labels: Record<string, string> = {
    performance: "Rendimiento",
    evaluationUrgency: "Evaluación próxima",
    inactivity: "Inactividad",
    recentQuiz: "Quiz reciente",
    difficulty: "Dificultad",
  };

  return labels[key] ?? key;
};

const averageOf = (items: AcademicGrade[]) =>
  items.length
    ? items.reduce((sum, grade) => sum + scoreOf(grade), 0) / items.length
    : 0;

const trendFor = (items: AcademicGrade[]) => {
  const ordered = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (ordered.length < 2) {
    return { delta: 0, label: "Sin tendencia suficiente" };
  }

  const recent = averageOf(ordered.slice(0, Math.min(3, ordered.length)));
  const previousSlice = ordered.slice(3, 6);
  const previous = previousSlice.length
    ? averageOf(previousSlice)
    : scoreOf(ordered[ordered.length - 1]);
  const delta = recent - previous;

  if (delta > 2) return { delta, label: "Mejorando" };
  if (delta < -2) return { delta, label: "Descendiendo" };
  return { delta, label: "Estable" };
};

const Progress = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [overview, setOverview] = useState<AdaptiveOverview | null>(null);
  const [history, setHistory] = useState<AdaptiveRiskHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "all";
  const [subjectId, setSubjectId] = useState(initialSubject);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [gradeData, adaptiveData, historyData] = await Promise.all([
        getGrades(),
        getAdaptiveOverview().catch(() => null),
        getAdaptiveHistory(undefined, 100).catch(() => []),
      ]);

      setGrades(gradeData);
      setOverview(adaptiveData);
      setHistory(historyData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar el progreso.",
      );
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

  const subjects = useMemo(
    () => Array.from(
      new Map(grades.map((grade) => [grade.subject.id, grade.subject])).values(),
    ),
    [grades],
  );

  const filtered = useMemo(() => grades.filter((grade) => {
    const matchesSubject = subjectId === "all" || grade.subject.id === subjectId;
    const text = `${grade.subject.name} ${grade.gradeType} ${grade.description}`.toLowerCase();
    return matchesSubject && text.includes(search.trim().toLowerCase());
  }), [grades, search, subjectId]);

  const average = averageOf(filtered);
  const approved = filtered.filter((grade) => scoreOf(grade) >= 70).length;
  const trend = trendFor(filtered);

  const selectedRisk = useMemo<AdaptiveRisk | null>(() => {
    if (!overview) return null;
    if (subjectId === "all") return overview.priority;
    return overview.risks.find((risk) => risk.subjectId === subjectId) ?? null;
  }, [overview, subjectId]);

  const selectedHistory = useMemo(() => {
    const targetSubjectId = subjectId === "all" ? selectedRisk?.subjectId : subjectId;
    if (!targetSubjectId) return [];

    return history
      .filter((entry) => entry.subjectId === targetSubjectId)
      .sort((a, b) => new Date(a.evaluatedAt).getTime() - new Date(b.evaluatedAt).getTime())
      .slice(-8);
  }, [history, selectedRisk?.subjectId, subjectId]);

  const riskEvolution = useMemo(() => {
    if (selectedHistory.length < 2) return null;
    const first = selectedHistory[0].score;
    const latest = selectedHistory[selectedHistory.length - 1].score;
    const delta = latest - first;

    return {
      delta,
      label: delta < 0 ? "El riesgo está bajando" : delta > 0 ? "El riesgo está subiendo" : "El riesgo se mantiene",
    };
  }, [selectedHistory]);

  const subjectSummaries = useMemo(() => {
    const bySubject = new Map<string, AcademicGrade[]>();

    for (const grade of grades) {
      const current = bySubject.get(grade.subject.id) ?? [];
      current.push(grade);
      bySubject.set(grade.subject.id, current);
    }

    return [...bySubject.entries()]
      .map(([id, subjectGrades]) => {
        const subject = subjectGrades[0].subject;
        const risk = overview?.risks.find((item) => item.subjectId === id) ?? null;
        const ordered = [...subjectGrades].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        return {
          id,
          name: subject.name,
          average: averageOf(subjectGrades),
          latest: ordered[0] ? scoreOf(ordered[0]) : 0,
          records: subjectGrades.length,
          trend: trendFor(subjectGrades),
          risk,
        };
      })
      .sort((a, b) => {
        const riskDelta = (b.risk?.score ?? 0) - (a.risk?.score ?? 0);
        if (riskDelta !== 0) return riskDelta;
        return a.average - b.average;
      });
  }, [grades, overview]);

  return (
    <ContentShell
      title="Progreso académico"
      description="Entiende cómo estás avanzando, qué materias requieren atención y por qué EduTrack ajusta tu plan."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button onClick={() => navigate("/practices")}>Ir a Mi plan</Button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card padding="md">
          <p className="text-sm text-muted">Registros</p>
          <p className="mt-2 text-3xl font-bold text-content">{filtered.length}</p>
          <p className="mt-1 text-xs text-muted">Calificaciones analizadas</p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-muted">Promedio</p>
          <p className="mt-2 text-3xl font-bold text-content">{average.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-muted">{approved} aprobadas con 70% o más</p>
        </Card>

        <Card padding="md">
          <p className="text-sm text-muted">Tendencia reciente</p>
          <p className="mt-2 text-2xl font-bold text-content">{trend.label}</p>
          <p className="mt-1 text-xs text-muted">
            {trend.delta === 0
              ? "Aún hacen falta más registros para comparar."
              : `${trend.delta > 0 ? "+" : ""}${trend.delta.toFixed(1)} puntos frente al periodo anterior.`}
          </p>
        </Card>

        <Card padding="md" className={selectedRisk?.level === "high" ? "prototype-priority" : ""}>
          <p className="text-sm text-muted">Riesgo académico</p>
          <p className="mt-2 text-3xl font-bold text-content">
            {selectedRisk ? `${selectedRisk.score}/100` : "—"}
          </p>
          <p className="mt-1 text-xs font-semibold text-primary">
            {selectedRisk ? riskLabel(selectedRisk.level) : "Sin análisis disponible"}
          </p>
        </Card>
      </section>

      {selectedRisk && (
        <Card padding="lg" className="prototype-priority">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <span className="prototype-eyebrow">Lectura inteligente</span>
              <h2 className="mt-1 text-2xl font-bold text-content">
                {selectedRisk.subject.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                EduTrack no usa solamente el promedio. También combina proximidad de evaluaciones,
                inactividad, quizzes recientes y dificultad declarada para decidir la prioridad.
              </p>

              <div className="mt-4 grid gap-2">
                {selectedRisk.reasons.map((reason) => (
                  <div key={reason} className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted">Factores del riesgo</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(selectedRisk.components).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted px-3 py-2.5">
                    <span className="text-xs text-muted">{componentLabel(key)}</span>
                    <strong className="text-sm text-content">+{value}</strong>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" onClick={() => navigate("/practices")}>Ver acción recomendada</Button>
            </div>
          </div>
        </Card>
      )}

      {selectedHistory.length > 0 && (
        <Card padding="lg">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="prototype-eyebrow">Evolución adaptativa</span>
              <h2 className="mt-1 text-xl font-bold text-content">Cómo ha cambiado el riesgo</h2>
              <p className="mt-2 text-sm text-muted">
                Cada punto representa una evaluación del motor provocada por una nota, quiz, sesión, evaluación o recálculo.
              </p>
            </div>
            {riskEvolution && (
              <div className="rounded-xl bg-surface-muted px-4 py-3 text-right">
                <strong className="block text-sm text-content">{riskEvolution.label}</strong>
                <span className="text-xs text-muted">
                  {riskEvolution.delta > 0 ? "+" : ""}{riskEvolution.delta} puntos en el periodo visible
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3">
            {selectedHistory.map((entry) => (
              <div key={entry.id} className="grid gap-2 md:grid-cols-[170px_1fr_90px] md:items-center">
                <div>
                  <p className="text-xs font-semibold text-content">{formatMoment(entry.evaluatedAt)}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{triggerLabel(entry.trigger)}</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(3, Math.min(100, entry.score))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <strong className="text-sm text-content">{entry.score}/100</strong>
                  <span className="text-[10px] font-semibold text-primary">{riskLabel(entry.level)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card padding="md">
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar evaluación o materia"
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"
          />
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"
          >
            <option value="all">Todas las materias</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {subjectId === "all" && subjectSummaries.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">Comparación por materia</span>
              <h2 className="mt-1 text-xl font-bold text-content">Dónde conviene enfocar el esfuerzo</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjectSummaries.map((summary) => (
              <button
                key={summary.id}
                type="button"
                onClick={() => setSubjectId(summary.id)}
                className="text-left"
              >
                <Card padding="md" className="h-full transition hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-content">{summary.name}</h3>
                      <p className="mt-1 text-xs text-muted">{summary.records} registros</p>
                    </div>
                    {summary.risk && (
                      <span className="prototype-badge">{summary.risk.score}/100</span>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="block text-[10px] uppercase tracking-[0.08em] text-muted">Promedio</span>
                      <strong className="mt-1 block text-lg text-content">{summary.average.toFixed(1)}%</strong>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="block text-[10px] uppercase tracking-[0.08em] text-muted">Última</span>
                      <strong className="mt-1 block text-lg text-content">{summary.latest.toFixed(1)}%</strong>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <span className="block text-[10px] uppercase tracking-[0.08em] text-muted">Tendencia</span>
                      <strong className="mt-1 block text-sm text-content">{summary.trend.label}</strong>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-primary">
                    {summary.risk ? riskLabel(summary.risk.level) : "Sin riesgo calculado"}
                  </p>
                </Card>
              </button>
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">No hay calificaciones</h2>
          <p className="mt-2 text-muted">Todavía no existen registros para los filtros seleccionados.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((grade) => {
              const score = scoreOf(grade);
              return (
                <Card key={grade.id} padding="md">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {grade.subject.name} · {grade.gradeType}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-content">{grade.description}</h2>
                      <p className="mt-2 text-sm text-muted">Fecha: {formatDate(grade.date)}</p>
                    </div>
                    <div className={`text-3xl font-bold ${score >= 70 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>
                      {score.toFixed(1)}%
                    </div>
                  </div>

                  {grade.gradeChanges.length > 0 && (
                    <div className="mt-4 border-t border-border pt-4">
                      <p className="text-sm font-semibold text-content">Historial de cambios</p>
                      <div className="mt-2 space-y-2">
                        {grade.gradeChanges.map((change) => (
                          <p key={change.id} className="text-sm text-muted">
                            {change.oldValue} → {change.newValue} · {change.reason ?? "Sin motivo"} · {formatDate(change.createdAt)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
        </div>
      )}
    </ContentShell>
  );
};

export default Progress;
