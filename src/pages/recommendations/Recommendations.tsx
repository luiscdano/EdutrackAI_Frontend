import { useCallback, useEffect, useMemo, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import Card from "../../components/ui/Card";
import { getRecommendations } from "../../services/content.service";
import type { StudyRecommendation } from "../../types/content.types";

interface Props { onBack: () => void; userId: string }

const Recommendations = ({ onBack, userId }: Props) => {
  const [items, setItems] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems((await getRecommendations()).filter((item) => item.user.id === userId)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las recomendaciones."); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const priorities = useMemo(() => Array.from(new Set(items.map((item) => item.priority))).sort(), [items]);
  const statuses = useMemo(() => Array.from(new Set(items.map((item) => item.status))).sort(), [items]);
  const filtered = useMemo(() => items.filter((item) => {
    const text = `${item.title} ${item.description} ${item.reason} ${item.subject.name}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) && (priority === "all" || item.priority === priority) && (status === "all" || item.status === status);
  }), [items, priority, search, status]);

  return <ContentShell title="Sugerencias de estudio" description="Consulta recomendaciones personalizadas, su motivo y los materiales asociados." onBack={onBack} loading={loading} error={error} onRetry={() => void load()}>
    <Card padding="md"><div className="grid gap-3 md:grid-cols-3"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar recomendación o materia" className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /><select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Toda prioridad</option>{priorities.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Todo estado</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></div></Card>
    {filtered.length === 0 ? <Card padding="lg" className="text-center"><h2 className="text-xl font-bold text-content">Sin sugerencias disponibles</h2><p className="mt-2 text-muted">Las recomendaciones aparecerán cuando el sistema identifique oportunidades de mejora.</p></Card> : <div className="grid gap-5 md:grid-cols-2">{filtered.map((item) => <Card key={item.id} padding="md"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.type}</span><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">Prioridad: {item.priority}</span><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{item.status}</span></div><h2 className="mt-4 text-xl font-bold text-content">{item.title}</h2><p className="mt-2 text-muted">{item.description}</p><div className="mt-4 rounded-control border border-border p-3 text-sm"><p className="font-semibold text-content">¿Por qué se recomienda?</p><p className="mt-1 text-muted">{item.reason}</p></div><p className="mt-4 text-sm text-muted">Materia: <span className="text-content">{item.subject.name}</span></p><a href={item.resource.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Abrir {item.resource.title}</a></Card>)}</div>}
  </ContentShell>;
};

export default Recommendations;
