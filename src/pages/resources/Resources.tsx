import { useCallback, useEffect, useMemo, useState } from "react";

import ContentShell from "../../components/content/ContentShell";
import Card from "../../components/ui/Card";
import { getResources } from "../../services/content.service";
import type { EducationalResource } from "../../types/content.types";

interface Props { onBack: () => void }

const Resources = ({ onBack }: Props) => {
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "all";
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setResources((await getResources()).filter((resource) => resource.isActive)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los recursos."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const subjects = useMemo(() => Array.from(new Map(resources.map((resource) => [resource.subject.id, resource.subject])).values()), [resources]);
  const types = useMemo(() => Array.from(new Set(resources.map((resource) => resource.resourceType))).sort(), [resources]);
  const difficulties = useMemo(() => Array.from(new Set(resources.map((resource) => resource.difficulty))).sort(), [resources]);
  const filtered = useMemo(() => resources.filter((resource) => {
    const text = `${resource.title} ${resource.description} ${resource.topic} ${resource.subject.name}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) && (subjectId === "all" || resource.subject.id === subjectId) && (type === "all" || resource.resourceType === type) && (difficulty === "all" || resource.difficulty === difficulty);
  }), [difficulty, resources, search, subjectId, type]);

  return <ContentShell title="Biblioteca de recursos" description="Explora materiales educativos reales por materia, tipo, dificultad y tema." onBack={onBack} loading={loading} error={error} onRetry={() => void load()}>
    <Card padding="md"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar recurso o tema" className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Todas las materias</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select><select value={type} onChange={(event) => setType(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Todos los tipos</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Toda dificultad</option>{difficulties.map((item) => <option key={item} value={item}>{item}</option>)}</select></div></Card>
    {filtered.length === 0 ? <Card padding="lg" className="text-center"><h2 className="text-xl font-bold text-content">No hay recursos</h2><p className="mt-2 text-muted">No se encontraron materiales para los filtros seleccionados.</p></Card> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map((resource) => <Card key={resource.id} padding="md"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-primary">{resource.resourceType}</p><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{resource.difficulty}</span></div><h2 className="mt-2 text-xl font-bold text-content">{resource.title}</h2><p className="mt-2 text-sm text-muted">{resource.description}</p><div className="mt-4 text-sm"><p className="text-content">{resource.subject.name}</p><p className="text-muted">Tema: {resource.topic}</p></div><a href={resource.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Abrir recurso</a></Card>)}</div>}
  </ContentShell>;
};

export default Resources;
