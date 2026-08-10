import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getAdaptiveOverview } from "../../services/adaptive.service";
import { getResources } from "../../services/content.service";
import type { AdaptiveOverview } from "../../types/adaptive.types";
import type { EducationalResource } from "../../types/content.types";

interface Props { onBack: () => void }

const Resources = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<EducationalResource[]>([]);
  const [overview, setOverview] = useState<AdaptiveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "all";
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [type, setType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [resourceData, adaptiveData] = await Promise.all([
        getResources(),
        getAdaptiveOverview().catch(() => null),
      ]);

      setResources(resourceData.filter((resource) => resource.isActive));
      setOverview(adaptiveData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar los recursos.",
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
      new Map(resources.map((resource) => [resource.subject.id, resource.subject])).values(),
    ),
    [resources],
  );
  const types = useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.resourceType))).sort(),
    [resources],
  );
  const difficulties = useMemo(
    () => Array.from(new Set(resources.map((resource) => resource.difficulty))).sort(),
    [resources],
  );

  const adaptiveResources = useMemo(() => {
    const map = new Map<string, { reason: string; priorityScore: number; activityTitle: string }>();

    for (const activity of overview?.plan ?? []) {
      const resource = activity.recommendation?.resource;
      if (!resource) continue;

      const current = map.get(resource.id);
      if (!current || activity.priorityScore > current.priorityScore) {
        map.set(resource.id, {
          reason: activity.reason,
          priorityScore: activity.priorityScore,
          activityTitle: activity.title,
        });
      }
    }

    return map;
  }, [overview]);

  const filtered = useMemo(() => resources
    .filter((resource) => {
      const text = `${resource.title} ${resource.description} ${resource.topic} ${resource.subject.name}`.toLowerCase();
      return text.includes(search.trim().toLowerCase())
        && (subjectId === "all" || resource.subject.id === subjectId)
        && (type === "all" || resource.resourceType === type)
        && (difficulty === "all" || resource.difficulty === difficulty);
    })
    .sort((a, b) => {
      const aPriority = adaptiveResources.get(a.id)?.priorityScore ?? -1;
      const bPriority = adaptiveResources.get(b.id)?.priorityScore ?? -1;
      if (bPriority !== aPriority) return bPriority - aPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }), [adaptiveResources, difficulty, resources, search, subjectId, type]);

  const recommendedCount = adaptiveResources.size;

  return (
    <ContentShell
      title="Biblioteca de recursos"
      description="Explora materiales por materia y encuentra primero los recursos que EduTrack relacionó con tu plan actual."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button variant="outline" onClick={() => navigate("/practices")}>Ver Mi plan</Button>}
    >
      {recommendedCount > 0 && (
        <Card padding="lg" className="prototype-priority">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="prototype-eyebrow">Selección adaptativa</span>
              <h2 className="mt-1 text-xl font-bold text-content">
                {recommendedCount} {recommendedCount === 1 ? "recurso está" : "recursos están"} conectado{recommendedCount === 1 ? "" : "s"} con tu plan
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Los materiales recomendados aparecen primero porque están relacionados con una materia o actividad que necesita atención ahora.
              </p>
            </div>
            <Button onClick={() => navigate("/practices")}>Revisar prioridad</Button>
          </div>
        </Card>
      )}

      <Card padding="md">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar recurso o tema"
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"
          />
          <select
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"
          >
            <option value="all">Todas las materias</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"
          >
            <option value="all">Todos los tipos</option>
            {types.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"
          >
            <option value="all">Toda dificultad</option>
            {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">No hay recursos</h2>
          <p className="mt-2 text-muted">No se encontraron materiales para los filtros seleccionados.</p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => {
            const adaptive = adaptiveResources.get(resource.id);

            return (
              <Card
                key={resource.id}
                padding="md"
                className={adaptive ? "prototype-priority" : ""}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-primary">{resource.resourceType}</p>
                    {adaptive && (
                      <span className="prototype-badge prototype-badge-attention">Recomendado por tu plan</span>
                    )}
                  </div>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">
                    {resource.difficulty}
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold text-content">{resource.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{resource.description}</p>

                <div className="mt-4 text-sm">
                  <p className="text-content">{resource.subject.name}</p>
                  <p className="text-muted">Tema: {resource.topic}</p>
                </div>

                {adaptive && (
                  <div className="mt-4 rounded-xl bg-surface-muted p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                      Relacionado con: {adaptive.activityTitle}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted">{adaptive.reason}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Abrir recurso
                  </a>
                  {adaptive && (
                    <Button variant="outline" onClick={() => navigate("/practices")}>Ver actividad</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ContentShell>
  );
};

export default Resources;
