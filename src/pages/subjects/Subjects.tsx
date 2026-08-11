import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  addCustomSubject,
  getStudentContext,
  removeMySubject,
  updateMySubject,
} from "../../services/student-context.service";
import type {
  StudentContextOverview,
  StudentSubjectAssignment,
} from "../../types/student-context.types";

interface Props { onBack: () => void }

const difficultyLabel = (value: string) => {
  if (value === "high") return "Me cuesta";
  if (value === "low") return "Se me da bien";
  return "Normal";
};

const Subjects = ({ onBack }: Props) => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentContextOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getStudentContext());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pude cargar tus materias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = useMemo(
    () => data?.subjects.filter((item) => item.status === "active") ?? [],
    [data],
  );
  const inactive = useMemo(
    () => data?.subjects.filter((item) => item.status !== "active") ?? [],
    [data],
  );

  const addSubject = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await addCustomSubject({ name: newName.trim(), difficultyLevel: "medium" });
      setNewName("");
      setShowAdd(false);
      await load();
    } catch (addError) {
      window.alert(addError instanceof Error ? addError.message : "No pude agregar la materia.");
    } finally {
      setAdding(false);
    }
  };

  const updateDifficulty = async (
    assignment: StudentSubjectAssignment,
    difficultyLevel: "low" | "medium" | "high",
  ) => {
    setWorkingId(assignment.id);
    try {
      await updateMySubject(assignment.id, { difficultyLevel });
      await load();
    } catch (updateError) {
      window.alert(updateError instanceof Error ? updateError.message : "No pude actualizar la materia.");
    } finally {
      setWorkingId(null);
    }
  };

  const remove = async (assignment: StudentSubjectAssignment) => {
    if (!window.confirm(`¿Quitar ${assignment.subject.name} de tus materias actuales?`)) return;
    setWorkingId(assignment.id);
    try {
      await removeMySubject(assignment.id);
      await load();
    } catch (removeError) {
      window.alert(removeError instanceof Error ? removeError.message : "No pude quitar la materia.");
    } finally {
      setWorkingId(null);
    }
  };

  const restore = async (assignment: StudentSubjectAssignment) => {
    setWorkingId(assignment.id);
    try {
      await updateMySubject(assignment.id, { status: "active" });
      await load();
    } catch (restoreError) {
      window.alert(restoreError instanceof Error ? restoreError.message : "No pude restaurar la materia.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <ContentShell
      title="Mis materias"
      description="Solo lo que estás cursando ahora. Tú decides qué entra y qué sale de tu semestre."
      onBack={onBack}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button onClick={() => setShowAdd((value) => !value)}>+ Agregar materia</Button>}
    >
      {data?.context && (
        <Card padding="md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="prototype-eyebrow">Tu contexto</span>
              <h2 className="mt-1 text-lg font-bold text-content">{data.context.institutionName}</h2>
              <p className="mt-1 text-sm text-muted">{data.context.programName} · Período {data.context.currentPeriod}</p>
              {data.context.sourceUrl && (
                <a href={data.context.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">Plan de estudios oficial ↗</a>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/onboarding")}>Cambiar período o carrera</Button>
          </div>
        </Card>
      )}

      {showAdd && (
        <Card padding="md" className="border-primary/25">
          <span className="prototype-eyebrow">Materia adicional</span>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void addSubject(); }}
              placeholder="Ej. Matemática Discreta"
              className="min-h-11 flex-1 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary"
            />
            <Button loading={adding} onClick={() => void addSubject()}>Agregar</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        </Card>
      )}

      {active.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">Todavía no tengo tus materias actuales</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">Configura tu período o agrega una materia. Con eso EduTrack puede empezar a decidir qué te conviene estudiar.</p>
          <Button className="mt-5" onClick={() => navigate("/onboarding")}>Preparar mi semestre</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {active.map((assignment) => (
            <Card key={assignment.id} padding="md" className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-primary">{assignment.curriculumCode ?? "Personal"}</span>
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-content">{assignment.subject.name}</h2>
                </div>
                <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] text-muted">
                  {assignment.source === "institution_catalog" ? "Pensum" : "Agregada por ti"}
                </span>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold text-muted">¿Cómo sientes esta materia?</label>
                <select
                  value={assignment.difficultyLevel}
                  disabled={workingId === assignment.id}
                  onChange={(event) => void updateDifficulty(assignment, event.target.value as "low" | "medium" | "high")}
                  className="mt-2 min-h-11 w-full rounded-control border border-border bg-app-bg px-3 text-sm text-content outline-none focus:border-primary"
                >
                  <option value="low">Se me da bien</option>
                  <option value="medium">Normal</option>
                  <option value="high">Me cuesta</option>
                </select>
                <p className="mt-2 text-xs text-muted">EduTrack usa esta señal junto con tus resultados. Ahora: {difficultyLabel(assignment.difficultyLevel)}.</p>
              </div>

              <div className="mt-5 flex flex-1 items-end gap-2">
                <Button size="sm" onClick={() => navigate(`/resources?subject=${assignment.subject.id}`)}>Recursos</Button>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/progress?subject=${assignment.subject.id}`)}>Progreso</Button>
                <Button size="sm" variant="ghost" disabled={workingId === assignment.id} onClick={() => void remove(assignment)}>Quitar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <section className="border-t border-border pt-5">
          <h2 className="text-sm font-bold text-content">Fuera de tu período actual</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {inactive.map((assignment) => (
              <button
                key={assignment.id}
                type="button"
                disabled={workingId === assignment.id}
                onClick={() => void restore(assignment)}
                className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted hover:border-primary/35 hover:text-content"
              >
                {assignment.subject.name} · volver a agregar
              </button>
            ))}
          </div>
        </section>
      )}
    </ContentShell>
  );
};

export default Subjects;
