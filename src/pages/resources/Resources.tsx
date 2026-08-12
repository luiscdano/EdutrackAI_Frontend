import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { discoverLearningResources } from "../../services/learning-resources.service";
import { getStudentContext } from "../../services/student-context.service";
import type {
  LearningResourceDiscovery,
  StudentSubjectAssignment,
} from "../../types/student-context.types";

interface Props { onBack: () => void }

const sourceLabel = (sourceKind: string) => {
  if (sourceKind === "student_material") return "Tu material";
  if (sourceKind === "provider_search") return "Fuente externa";
  return "Recurso del curso";
};

const Resources = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialSubjectId = params.get("subject") ?? "";
  const initialTopic = params.get("topic") ?? "";
  const [subjects, setSubjects] = useState<StudentSubjectAssignment[]>([]);
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [topic, setTopic] = useState(initialTopic);
  const [discovery, setDiscovery] = useState<LearningResourceDiscovery | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discover = useCallback(async (nextSubjectId: string, nextTopic = topic) => {
    if (!nextSubjectId) return;
    setSearching(true);
    setError(null);
    try {
      setDiscovery(await discoverLearningResources(nextSubjectId, nextTopic.trim() || undefined));
    } catch (discoverError) {
      setError(discoverError instanceof Error ? discoverError.message : "No pude buscar recursos.");
    } finally {
      setSearching(false);
    }
  }, [topic]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const context = await getStudentContext();
        if (!active) return;
        const current = context.subjects.filter((item) => item.status === "active");
        setSubjects(current);
        const initial = initialSubjectId && current.some((item) => item.subject.id === initialSubjectId)
          ? initialSubjectId
          : current[0]?.subject.id ?? "";
        setSubjectId(initial);
        if (initial) {
          const result = await discoverLearningResources(initial, initialTopic.trim() || undefined);
          if (active) setDiscovery(result);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No pude cargar tus recursos.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [initialSubjectId, initialTopic]);

  return (
    <ContentShell
      title="Recursos"
      description="Material para tus materias actuales. Primero mostramos tu material y recursos del curso; después, fuentes externas contextualizadas."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => subjectId && void discover(subjectId)}
      actions={<Button variant="outline" onClick={() => navigate("/subjects")}>Mis materias</Button>}
    >
      {subjects.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">Primero necesito saber qué materias cursas</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">Así evitamos mostrarte una biblioteca enorme que no tiene nada que ver contigo.</p>
          <Button className="mt-5" onClick={() => navigate("/onboarding")}>Configurar materias</Button>
        </Card>
      ) : (
        <>
          <Card padding="md">
            <div className="grid gap-3 lg:grid-cols-[260px_1fr_auto]">
              <select
                value={subjectId}
                onChange={(event) => {
                  const next = event.target.value;
                  setSubjectId(next);
                  void discover(next);
                }}
                className="min-h-11 rounded-control border border-border bg-app-bg px-3 text-sm text-content outline-none focus:border-primary"
              >
                {subjects.map((assignment) => (
                  <option key={assignment.id} value={assignment.subject.id}>{assignment.subject.name}</option>
                ))}
              </select>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") void discover(subjectId); }}
                placeholder="Tema real de clase: MAUI, normalización, derivadas..."
                className="min-h-11 rounded-control border border-border bg-app-bg px-4 text-sm text-content outline-none focus:border-primary"
              />
              <Button loading={searching} onClick={() => void discover(subjectId)}>Buscar tema</Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
              <span>Escribe el concepto que estás estudiando, no el tipo de recurso. “Video” o “recurso” no se usan como tema.</span>
              <button type="button" onClick={() => navigate(`/capture?subject=${subjectId}`)} className="font-semibold text-primary">Añadir material del profesor →</button>
            </div>
          </Card>

          {discovery && (
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="prototype-eyebrow">{discovery.subject.name}</span>
                  <h2 className="mt-1 text-xl font-bold text-content">{discovery.topic ? `Recursos para ${discovery.topic}` : "Fuentes para empezar"}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {discovery.topic
                      ? "Las fuentes externas usan la materia + este tema para evitar búsquedas genéricas."
                      : "Sin un tema concreto te mostramos fuentes base relacionadas con la materia."}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Contexto visible</span>
              </div>

              {discovery.resources.length === 0 ? (
                <Card padding="lg" className="text-center">
                  <h3 className="font-bold text-content">Todavía no hay material para ese tema</h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-muted">Añade el material de tu profesor o prueba un tema más específico.</p>
                  <Button className="mt-4" size="sm" onClick={() => navigate(`/capture?subject=${subjectId}`)}>Añadir material</Button>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {discovery.resources.map((resource) => (
                    <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="group block">
                      <Card padding="md" className="flex h-full min-h-[230px] flex-col transition group-hover:-translate-y-0.5 group-hover:border-primary/35">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-primary">{resource.provider}</span>
                            <span className="mt-1 block text-[10px] uppercase tracking-[0.08em] text-muted">{resource.resourceType}</span>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${resource.sourceKind === "student_material" ? "bg-primary/10 text-primary" : "bg-surface-muted text-muted"}`}>
                            {sourceLabel(resource.sourceKind)}
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-bold leading-6 text-content">{resource.title}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{resource.description}</p>
                        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
                          <span>{resource.difficulty}</span>
                          <span className="font-semibold text-primary">Abrir ↗</span>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </ContentShell>
  );
};

export default Resources;
