import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ContentShell from "../../components/content/ContentShell";
import Card from "../../components/ui/Card";
import { getGrades } from "../../services/content.service";
import type { AcademicGrade } from "../../types/content.types";

interface Props { onBack: () => void }

const scoreOf = (grade: AcademicGrade) => Number(grade.gradeValue) || 0;
const formatDate = (value: string) => new Date(value).toLocaleDateString("es-DO");

const Progress = ({ onBack }: Props) => {
  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const initialSubject = new URLSearchParams(window.location.search).get("subject") ?? "all";
  const [subjectId, setSubjectId] = useState(initialSubject);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setGrades(await getGrades()); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el progreso."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const subjects = useMemo(() => Array.from(new Map(grades.map((grade) => [grade.subject.id, grade.subject])).values()), [grades]);
  const filtered = useMemo(() => grades.filter((grade) => {
    const matchesSubject = subjectId === "all" || grade.subject.id === subjectId;
    const text = `${grade.subject.name} ${grade.gradeType} ${grade.description}`.toLowerCase();
    return matchesSubject && text.includes(search.trim().toLowerCase());
  }), [grades, search, subjectId]);
  const average = filtered.length ? filtered.reduce((sum, grade) => sum + scoreOf(grade), 0) / filtered.length : 0;
  const approved = filtered.filter((grade) => scoreOf(grade) >= 70).length;

  return (
    <ContentShell title="Progreso académico" description="Consulta tus calificaciones, promedios, cambios y evolución por materia." onBack={onBack} loading={loading} error={error} onRetry={() => void load()}>
      <section className="grid gap-4 sm:grid-cols-3">
        <Card padding="md"><p className="text-sm text-muted">Registros</p><p className="mt-2 text-3xl font-bold text-content">{filtered.length}</p></Card>
        <Card padding="md"><p className="text-sm text-muted">Promedio</p><p className="mt-2 text-3xl font-bold text-content">{average.toFixed(1)}%</p></Card>
        <Card padding="md"><p className="text-sm text-muted">Aprobados</p><p className="mt-2 text-3xl font-bold text-content">{approved}</p></Card>
      </section>
      <Card padding="md"><div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar evaluación o materia" className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" />
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary"><option value="all">Todas las materias</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
      </div></Card>
      {filtered.length === 0 ? <Card padding="lg" className="text-center"><h2 className="text-xl font-bold text-content">No hay calificaciones</h2><p className="mt-2 text-muted">Todavía no existen registros para los filtros seleccionados.</p></Card> : (
        <div className="space-y-4">{filtered.map((grade) => {
          const score = scoreOf(grade);
          return <Card key={grade.id} padding="md"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm font-semibold text-primary">{grade.subject.name} · {grade.gradeType}</p><h2 className="mt-1 text-lg font-bold text-content">{grade.description}</h2><p className="mt-2 text-sm text-muted">Fecha: {formatDate(grade.date)}</p></div><div className={`text-3xl font-bold ${score >= 70 ? "text-emerald-300" : score >= 60 ? "text-amber-300" : "text-red-300"}`}>{score.toFixed(1)}%</div></div>{grade.gradeChanges.length > 0 && <div className="mt-4 border-t border-border pt-4"><p className="text-sm font-semibold text-content">Historial de cambios</p><div className="mt-2 space-y-2">{grade.gradeChanges.map((change) => <p key={change.id} className="text-sm text-muted">{change.oldValue} → {change.newValue} · {change.reason ?? "Sin motivo"} · {formatDate(change.createdAt)}</p>)}</div></div>}</Card>;
        })}</div>
      )}
    </ContentShell>
  );
};

export default Progress;
