import { useCallback, useEffect, useMemo, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import StatsCard from "../../components/dashboard/StatsCard";
import Card from "../../components/ui/Card";
import { getAdminStats, getAuditLogs } from "../../services/content.service";
import type { AdminStats, AuditLog } from "../../types/content.types";

interface Props { onBack: () => void }
const formatDate = (value: string) => new Date(value).toLocaleString("es-DO");

const AdminDashboard = ({ onBack }: Props) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const [nextStats, audit] = await Promise.all([getAdminStats(), getAuditLogs()]); setStats(nextStats); setLogs(audit.data); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el dashboard administrativo."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

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

  return <ContentShell title="Dashboard administrativo" description="Indicadores generales, distribución del contenido y actividad reciente del sistema." onBack={onBack} loading={loading} error={error} onRetry={() => void load()}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((item) => <StatsCard key={item.title} {...item} />)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><Card padding="md"><h2 className="text-xl font-bold text-content">Distribución general</h2><div className="mt-5 space-y-4">{metrics.slice(1).map((item) => <div key={item.title}><div className="mb-2 flex justify-between text-sm"><span className="text-muted">{item.title}</span><span className="font-semibold text-content">{item.value}</span></div><div className="h-3 overflow-hidden rounded-full bg-app-bg"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Number(item.value) / maxValue * 100)}%` }} /></div></div>)}</div></Card><Card padding="md"><h2 className="text-xl font-bold text-content">Actividad reciente</h2>{logs.length === 0 ? <p className="mt-5 text-muted">No hay eventos de auditoría registrados.</p> : <div className="mt-5 space-y-3">{logs.map((log) => <article key={log.id} className="rounded-control border border-border p-3"><p className="font-semibold text-content">{log.action}</p><p className="mt-1 text-sm text-muted">{log.entityName}{log.entityId ? ` · ${log.entityId}` : ""}</p><p className="mt-1 text-xs text-muted">{log.user ? `${log.user.firstName} ${log.user.lastName}` : "Sistema"} · {formatDate(log.createdAt)}</p></article>)}</div>}</Card></div>
  </ContentShell>;
};

export default AdminDashboard;
