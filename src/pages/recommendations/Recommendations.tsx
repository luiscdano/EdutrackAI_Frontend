import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getAdaptiveOverview } from "../../services/adaptive.service";
import { getRecommendations } from "../../services/content.service";
import type { AdaptiveOverview } from "../../types/adaptive.types";
import type { StudyRecommendation } from "../../types/content.types";

interface Props { onBack: () => void; userId: string }

const priorityLabel = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized === "high") return "Alta";
  if (normalized === "medium") return "Media";
  if (normalized === "low") return "Baja";
  return value;
};

const statusLabel = (value: string) => {
  const normalized = value.toLowerCase();
  if (normalized === "pending") return "Pendiente";
  if (normalized === "resolved") return "Resuelta";
  if (normalized === "completed") return "Completada";
  if (normalized === "dismissed") return "Descartada";
  return value;
};

const typeLabel = (value: string) => {
  if (value === "adaptive_study") return "Generada por EduTrack";
  return value.replaceAll("_", " ");
};

const Recommendations = ({ onBack, userId }: Props) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<StudyRecommendation[]>([]);
  const [overview, setOverview] = useState<AdaptiveOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [recommendationData, adaptiveData] = await Promise.all([
        getRecommendations(),
        getAdaptiveOverview().catch(() => null),
      ]);
      setItems(recommendationData.filter((item) => item.user.id === userId));
      setOverview(adaptiveData);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar las recomendaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const priorities = useMemo(
    () => Array.from(new Set(items.map((item) => item.priority))).sort(),
    [items],
  );
  const statuses = useMemo(
    () => Array.from(new Set(items.map((item) => item.status))).sort(),
    [items],
  );
  const linkedRecommendationIds = useMemo(
    () => new Set(
      (overview?.plan ?? [])
        .map((activity) => activity.recommendation?.id)
        .filter((id): id is string => Boolean(id)),
    ),
    [overview],
  );

  const filtered = useMemo(() => items
    .filter((item) => {
      const text = `${item.title} ${item.description} ${item.reason} ${item.subject.name}`.toLowerCase();
      return text.includes(search.trim().toLowerCase())
        && (priority === "all" || item.priority === priority)
        && (status === "all" || item.status === status);
    })
    .sort((a, b) => {
      const aLinked = linkedRecommendationIds.has(a.id) ? 1 : 0;
      const bLinked = linkedRecommendationIds.has(b.id) ? 1 : 0;
      if (bLinked !== aLinked) return bLinked - aLinked;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (b.priority === "high" && a.priority !== "high") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }), [items, linkedRecommendationIds, priority, search, status]);

  const currentAdaptive = items.filter(
    (item) => item.type === "adaptive_study" && item.status === "pending",
  ).length;

  return (
    <ContentShell
      title="Sugerencias de estudio"
      description="Recomendaciones explicables conectadas con las materias, recursos y actividades que requieren atención."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button onClick={() => navigate("/practices")}>Abrir Mi plan</Button>}
    >
      {currentAdaptive > 0 && (
        <Card padding="lg" className="prototype-priority">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="prototype-eyebrow">Recomendaciones activas</span>
              <h2 className="mt-1 text-xl font-bold text-content">
                EduTrack generó {currentAdaptive} {currentAdaptive === 1 ? "sugerencia" : "sugerencias"} a partir de tu riesgo actual
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Cada recomendación conserva el motivo que la originó y puede estar enlazada a una actividad concreta de tu plan.
              </p>
            </div>
            <Button onClick={() => navigate("/practices")}>Ver acciones</Button>
          </div>
        </Card>
      )}

      <Card padding="md">
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar recomendación o materia"
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"
          />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"
          >
            <option value="all">Toda prioridad</option>
            {priorities.map((value) => (
              <option key={value} value={value}>{priorityLabel(value)}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-control border border-border bg-app-bg px-4 py-3 text-content"
          >
            <option value="all">Todo estado</option>
            {statuses.map((value) => (
              <option key={value} value={value}>{statusLabel(value)}</option>
            ))}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">Sin sugerencias disponibles</h2>
          <p className="mt-2 text-muted">
            Las recomendaciones aparecerán cuando el sistema identifique oportunidades de mejora.
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((item) => {
            const linked = linkedRecommendationIds.has(item.id);
            const adaptive = item.type === "adaptive_study";

            return (
              <Card
                key={item.id}
                padding="md"
                className={linked || adaptive ? "prototype-priority" : ""}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {typeLabel(item.type)}
                  </span>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">
                    Prioridad: {priorityLabel(item.priority)}
                  </span>
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">
                    {statusLabel(item.status)}
                  </span>
                  {linked && <span className="prototype-badge prototype-badge-attention">En Mi plan</span>}
                </div>

                <h2 className="mt-4 text-xl font-bold text-content">{item.title}</h2>
                <p className="mt-2 leading-6 text-muted">{item.description}</p>

                <div className="mt-4 rounded-control border border-border p-3 text-sm">
                  <p className="font-semibold text-content">¿Por qué se recomienda?</p>
                  <p className="mt-1 leading-6 text-muted">{item.reason}</p>
                </div>

                <p className="mt-4 text-sm text-muted">
                  Materia: <span className="text-content">{item.subject.name}</span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={item.resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Abrir {item.resource.title}
                  </a>
                  {linked && (
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

export default Recommendations;
