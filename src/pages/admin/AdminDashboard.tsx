import { useCallback, useEffect, useMemo, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import StatsCard from "../../components/dashboard/StatsCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  getAdminAdaptiveRiskOverview,
  recalculateAllAdaptivePlans,
} from "../../services/adaptive.service";
import { getAdminStats, getAuditLogs } from "../../services/content.service";
import type { AdminAdaptiveRiskOverview, RiskLevel } from "../../types/adaptive.types";
import type { AdminStats, AuditLog } from "../../types/content.types";

interface Props { onBack: () => void }
const formatDate = (value: string) => new Date(value).toLocaleString("es-DO");

const riskLabel = (level: RiskLevel) => {
  if (level === "high") return "Prioridad alta";
  if (level === "attention") return "Necesita atención";
  if (level === "watch") return "En observación";
  return "Estable";
};

const AdminDashboard = ({ onBack }: Props) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [adaptive, setAdaptive] = useState<AdminAdaptiveRiskOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextStats, audit, adaptiveRisk] = await Promise.all([
        getAdminStats(),
        getAuditLogs(),
        getAdminAdaptiveRiskOverview().catch(() => null),
      ]);
      setStats(nextStats);
      setLogs(audit.data);
      setAdaptive(adaptiveRisk);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar el dashboard administrativo.",
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

  const recalculateRisks = async () => {
    if (recalculating) return;
    setRecalculating(true);

    try {
      const results = await recalculateAllAdaptivePlans();
      const failed = results.filter((item) => !item.ok);
      const refreshed = await getAdminAdaptiveRiskOverview();
      setAdaptive(refreshed);

      if (failed.length > 0) {
        window.alert(`Se recalcularon los usuarios activos, pero ${failed.length} no pudieron procesarse.`);
      }
    } catch (operationError) {
      window.alert(
        operationError instanceof Error
          ? operationError.message
          : "No fue posible recalcular los riesgos.",
      );
    } finally {
      setRecalculating(false);
    }
  };

  const metrics = useMemo(() => stats ? [
    { title: "Usuarios", value: stats.users.total, subtitle: `${stats.users.active} activos` },
    { title: "Materias", value: stats.subjects.total, subtitle: "Registradas" },
    { title: "Quizzes", value: stats.quizzes.total, subtitle: `${stats.quizzes.attempts} intentos` },
    { title: "Calificaciones", value: stats.grades.total, subtitle: "Registros" },
    { title: "Sesiones", value: stats.studySessions.total, subtitle: "Sesiones de estudio" },
    { title: "Recursos", value: stats.resources.total, subtitle: "Materiales" },
    { title: "Recomendaciones", value: stats.recommendations.total, subtitle: "Generadas" },
  ] : [], [stats]);
  const maxValue = Math.max(1, ...metrics.map((item) => Number(item.value)));

  const riskMetrics = adaptive ? [
    { label: "Prioridad alta", value: adaptive.summary.high, detail: "Requieren intervención primero" },
    { label: "Atención", value: adaptive.summary.attention, detail: "Necesitan seguimiento" },
    { label: "En observación", value: adaptive.summary.watch, detail: "Conviene monitorear" },
    { label: "Estables", value: adaptive.summary.stable, detail: "Sin señal de riesgo relevante" },
  ] : [];

  return (
    <ContentShell
      title="Dashboard administrativo"
      description="Indicadores generales, riesgo académico y actividad reciente del sistema."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        <Button loading={recalculating} onClick={() => void recalculateRisks()}>
          Recalcular riesgos
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => <StatsCard key={item.title} {...item} />)}
      </div>

      {adaptive && (
        <section className="grid gap-4">
          <div>
            <span className="prototype-eyebrow">Motor adaptativo</span>
            <h2 className="mt-1 text-xl font-bold text-content">Panorama de riesgo académico</h2>
            <p className="mt-1 text-sm text-muted">
              Se muestra la materia con mayor riesgo actual de cada estudiante rastreado.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {riskMetrics.map((item) => (
              <Card key={item.label} padding="md" className={item.label === "Prioridad alta" && item.value > 0 ? "prototype-priority" : ""}>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</span>
                <strong className="mt-2 block text-3xl font-bold text-content">{item.value}</strong>
                <small className="mt-1 block text-xs text-muted">{item.detail}</small>
              </Card>
            ))}
          </div>

          <Card padding="lg" className={adaptive.summary.high > 0 ? "prototype-priority" : ""}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-content">Estudiantes a revisar primero</h3>
                <p className="mt-1 text-sm text-muted">
                  {adaptive.totalTrackedStudents} estudiantes tienen historial de análisis adaptativo.
                </p>
              </div>
              <span className="prototype-badge">Actualizado {formatDate(adaptive.generatedAt)}</span>
            </div>

            {adaptive.students.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Todavía no hay análisis de riesgo registrados.</p>
            ) : (
              <div className="mt-5 grid gap-3">
                {adaptive.students.slice(0, 8).map((item) => (
                  <article
                    key={item.user.id}
                    className="grid gap-3 rounded-xl border border-border bg-surface-muted/40 p-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(200px,0.7fr)_110px_minmax(260px,1.2fr)] lg:items-center"
                  >
                    <div>
                      <strong className="block text-sm text-content">
                        {item.user.firstName} {item.user.lastName}
                      </strong>
                      <span className="mt-1 block text-xs text-muted">{item.user.studentCode}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-muted">Materia prioritaria</span>
                      <strong className="mt-1 block text-sm text-content">{item.subject.name}</strong>
                    </div>
                    <div>
                      <strong className="block text-xl text-content">{item.score}/100</strong>
                      <span className="mt-1 block text-[10px] font-semibold text-primary">{riskLabel(item.level)}</span>
                    </div>
                    <div>
                      <p className="text-xs leading-5 text-muted">
                        {item.reasons[0] ?? "Sin explicación adicional registrada."}
                      </p>
                      <span className="mt-1 block text-[10px] text-muted">{formatDate(item.evaluatedAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Card>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="text-xl font-bold text-content">Distribución general</h2>
          <div className="mt-5 space-y-4">
            {metrics.slice(1).map((item) => (
              <div key={item.title}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted">{item.title}</span>
                  <span className="font-semibold text-content">{item.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-app-bg">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(4, Number(item.value) / maxValue * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <h2 className="text-xl font-bold text-content">Actividad reciente</h2>
          {logs.length === 0 ? (
            <p className="mt-5 text-muted">No hay eventos de auditoría registrados.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {logs.map((log) => (
                <article key={log.id} className="rounded-control border border-border p-3">
                  <p className="font-semibold text-content">{log.action}</p>
                  <p className="mt-1 text-sm text-muted">
                    {log.entityName}{log.entityId ? ` · ${log.entityId}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : "Sistema"} · {formatDate(log.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </ContentShell>
  );
};

export default AdminDashboard;
