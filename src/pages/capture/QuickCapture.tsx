import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { getStudentContext } from "../../services/student-context.service";
import {
  createStudentAcademicItem,
  createStudentGrade,
} from "../../services/student-inputs.service";
import type { StudentSubjectAssignment } from "../../types/student-context.types";

type CaptureMode = "grade" | "deadline" | "material";

const modeInfo: Record<CaptureMode, { label: string; helper: string }> = {
  grade: {
    label: "Nota",
    helper: "Te entregaron una calificación.",
  },
  deadline: {
    label: "Fecha importante",
    helper: "Parcial, entrega, presentación o examen.",
  },
  material: {
    label: "Material de clase",
    helper: "Un enlace del profesor, aula virtual o documento online.",
  },
};

const today = () => new Date().toISOString().slice(0, 10);

const QuickCapture = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const initialSubjectId = useMemo(
    () => new URLSearchParams(window.location.search).get("subject") ?? "",
    [],
  );
  const [subjects, setSubjects] = useState<StudentSubjectAssignment[]>([]);
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [mode, setMode] = useState<CaptureMode>("grade");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gradeValue, setGradeValue] = useState("");
  const [gradeType, setGradeType] = useState("Parcial");
  const [gradeTitle, setGradeTitle] = useState("");
  const [gradeDate, setGradeDate] = useState(today());

  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineTopic, setDeadlineTopic] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");

  const [materialTitle, setMaterialTitle] = useState("");
  const [materialTopic, setMaterialTopic] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [materialDescription, setMaterialDescription] = useState("");

  useEffect(() => {
    let active = true;
    void getStudentContext()
      .then((context) => {
        if (!active) return;
        const current = context.subjects.filter((item) => item.status === "active");
        setSubjects(current);
        const preferred = initialSubjectId && current.some((item) => item.subject.id === initialSubjectId)
          ? initialSubjectId
          : current[0]?.subject.id ?? "";
        setSubjectId(preferred);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No pude cargar tus materias.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialSubjectId]);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const save = async () => {
    if (!subjectId || !user) return;
    setSaving(true);
    setError(null);

    try {
      if (mode === "grade") {
        const numericValue = Number(gradeValue);
        if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
          throw new Error("Escribe una nota entre 0 y 100.");
        }
        if (!gradeTitle.trim()) throw new Error("Ponle un nombre a la evaluación.");

        await createStudentGrade({
          userId: user.id,
          subjectId,
          gradeValue: numericValue,
          gradeType,
          description: gradeTitle.trim(),
          date: new Date(`${gradeDate}T12:00:00`).toISOString(),
        });
      }

      if (mode === "deadline") {
        if (!deadlineTitle.trim() || !deadlineAt) {
          throw new Error("Indica qué ocurre y cuándo.");
        }
        await createStudentAcademicItem({
          subjectId,
          itemType: "deadline",
          title: deadlineTitle.trim(),
          topic: deadlineTopic.trim() || undefined,
          scheduledAt: new Date(deadlineAt).toISOString(),
        });
      }

      if (mode === "material") {
        if (!materialTitle.trim() || !materialUrl.trim()) {
          throw new Error("Indica el nombre y el enlace del material.");
        }
        await createStudentAcademicItem({
          subjectId,
          itemType: "material",
          title: materialTitle.trim(),
          topic: materialTopic.trim() || undefined,
          url: materialUrl.trim(),
          description: materialDescription.trim() || undefined,
        });
      }

      navigate("/", { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No pude guardar este dato.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-[55vh] place-items-center"><Loader showLabel label="Preparando..." /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl pb-10">
      <header className="mb-6">
        <span className="prototype-eyebrow">Añadir</span>
        <h1 className="mt-1 text-[clamp(1.9rem,5vw,3rem)] font-bold tracking-[-0.045em] text-content">Cuéntame qué cambió.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Solo registra lo que EduTrack no pueda conocer automáticamente. Con eso reajusto el contexto detrás.</p>
      </header>

      {subjects.length === 0 ? (
        <Card padding="lg" className="text-center">
          <h2 className="text-xl font-bold text-content">Primero agrega tus materias</h2>
          <p className="mt-2 text-sm text-muted">Necesito saber a qué materia pertenece el dato.</p>
          <Button className="mt-5" onClick={() => navigate("/onboarding")}>Preparar mi semestre</Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(modeInfo) as CaptureMode[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => { setMode(value); setError(null); }}
                className={`rounded-2xl border p-4 text-left transition ${mode === value ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/35"}`}
              >
                <strong className="block text-sm text-content">{modeInfo[value].label}</strong>
                <span className="mt-1 block text-xs leading-5 text-muted">{modeInfo[value].helper}</span>
              </button>
            ))}
          </div>

          <Card padding="lg" className="mt-4">
            <label className="grid gap-2 text-sm font-semibold text-content">
              Materia
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content outline-none focus:border-primary">
                {subjects.map((assignment) => (
                  <option key={assignment.id} value={assignment.subject.id}>{assignment.subject.name}</option>
                ))}
              </select>
            </label>

            {mode === "grade" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  ¿Qué nota sacaste?
                  <input type="number" min={0} max={100} step="0.1" value={gradeValue} onChange={(event) => setGradeValue(event.target.value)} placeholder="Ej. 85" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Tipo
                  <select value={gradeType} onChange={(event) => setGradeType(event.target.value)} className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content outline-none focus:border-primary">
                    {["Tarea", "Quiz", "Parcial", "Examen", "Proyecto", "Práctica", "Otro"].map((value) => <option key={value}>{value}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  Nombre
                  <input value={gradeTitle} onChange={(event) => setGradeTitle(event.target.value)} placeholder="Ej. Parcial 1" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Fecha
                  <input type="date" value={gradeDate} onChange={(event) => setGradeDate(event.target.value)} className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
              </div>
            )}

            {mode === "deadline" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  ¿Qué viene?
                  <input value={deadlineTitle} onChange={(event) => setDeadlineTitle(event.target.value)} placeholder="Ej. Parcial 2, Entrega proyecto..." className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Tema, si lo sabes
                  <input value={deadlineTopic} onChange={(event) => setDeadlineTopic(event.target.value)} placeholder="Ej. Normalización" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Fecha y hora
                  <input type="datetime-local" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <p className="sm:col-span-2 text-xs leading-5 text-muted">Esta fecha entra inmediatamente en tu planificación. No necesitas crear un plan manual.</p>
              </div>
            )}

            {mode === "material" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  Nombre del material
                  <input value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Ej. Presentación del profesor - Normalización" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold sm:col-span-2">
                  Enlace
                  <input type="url" value={materialUrl} onChange={(event) => setMaterialUrl(event.target.value)} placeholder="https://..." className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Tema
                  <input value={materialTopic} onChange={(event) => setMaterialTopic(event.target.value)} placeholder="Ej. 1FN, 2FN y 3FN" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <label className="grid gap-2 text-sm font-semibold">
                  Nota breve
                  <input value={materialDescription} onChange={(event) => setMaterialDescription(event.target.value)} placeholder="Ej. Esto fue lo de la clase de hoy" className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary" />
                </label>
                <p className="sm:col-span-2 text-xs leading-5 text-muted">Los materiales que agregues aparecen primero cuando EduTrack te recomiende estudiar esa materia o tema.</p>
              </div>
            )}

            {error && <div className="mt-5 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button loading={saving} onClick={() => void save()}>Guardar</Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default QuickCapture;
