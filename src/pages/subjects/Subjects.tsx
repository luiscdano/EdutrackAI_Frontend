import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getSubjects } from "../../services/content.service";
import type { ContentSubject } from "../../types/content.types";

interface Props { onBack: () => void }

interface SubjectMetadata {
  code?: string;
  program?: string;
  credits?: number;
  difficulty?: string;
}

const readMetadata = (description: string): SubjectMetadata | null => {
  const prefix = "EDUTRACK_ADMIN:";
  if (!description.startsWith(prefix)) return null;
  try {
    return JSON.parse(description.slice(prefix.length)) as SubjectMetadata;
  } catch {
    return null;
  }
};

const Subjects = ({ onBack }: Props) => {
  const [subjects, setSubjects] = useState<ContentSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSubjects(await getSubjects());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las materias.");
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

  const filtered = useMemo(() => subjects.filter((subject) => {
    const metadata = readMetadata(subject.description);
    const searchable = [subject.name, subject.level, metadata?.code, metadata?.program]
      .filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = searchable.includes(search.trim().toLowerCase());
    const matchesStatus = status === "all" || (status === "active" ? subject.isActive : !subject.isActive);
    return matchesSearch && matchesStatus;
  }), [search, status, subjects]);

  return (
    <ContentShell title="Materias" description="Consulta las materias disponibles, sus datos académicos y accesos relacionados." onBack={onBack} loading={loading} error={error} onRetry={() => void load()}>
      <Card padding="md">
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código, nivel o programa" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" />
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary">
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center"><h2 className="text-xl font-bold text-content">No hay materias para mostrar</h2><p className="mt-2 text-muted">Cambia los filtros o verifica que existan materias registradas.</p></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((subject) => {
            const metadata = readMetadata(subject.description);
            const selected = selectedId === subject.id;
            return (
              <Card key={subject.id} padding="md" className="h-fit">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-sm font-semibold text-primary">{metadata?.code ?? `Nivel ${subject.level}`}</p><h2 className="mt-1 text-xl font-bold text-content">{subject.name}</h2></div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${subject.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-muted"}`}>{subject.isActive ? "Activa" : "Inactiva"}</span>
                </div>
                <p className="mt-3 text-sm text-muted">{metadata?.program ?? (subject.description.startsWith("EDUTRACK_ADMIN:") ? "Programa general" : subject.description)}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-control bg-surface-muted p-2"><p className="font-bold text-content">{subject._count.grades}</p><p className="text-muted">Notas</p></div>
                  <div className="rounded-control bg-surface-muted p-2"><p className="font-bold text-content">{subject._count.resouces}</p><p className="text-muted">Recursos</p></div>
                  <div className="rounded-control bg-surface-muted p-2"><p className="font-bold text-content">{subject._count.quizzies}</p><p className="text-muted">Quizzes</p></div>
                </div>
                {selected && (
                  <div className="mt-4 rounded-control border border-border p-3 text-sm text-muted">
                    <p>Nivel/semestre: <span className="text-content">{subject.level}</span></p>
                    <p>Créditos: <span className="text-content">{metadata?.credits ?? "No indicado"}</span></p>
                    <p>Dificultad: <span className="text-content">{metadata?.difficulty ?? "No indicada"}</span></p>
                    <p>Sesiones registradas: <span className="text-content">{subject._count.studySessions}</span></p>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedId(selected ? null : subject.id)}>{selected ? "Ocultar" : "Detalle"}</Button>
                  <Button size="sm" variant="secondary" onClick={() => window.location.assign(`/progress?subject=${subject.id}`)}>Progreso</Button>
                  <Button size="sm" variant="secondary" onClick={() => window.location.assign(`/resources?subject=${subject.id}`)}>Recursos</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ContentShell>
  );
};

export default Subjects;
