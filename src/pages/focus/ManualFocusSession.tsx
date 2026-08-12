import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { createStudySession } from "../../services/study-session.service";
import { getStudentContext } from "../../services/student-context.service";
import type { StudentSubjectAssignment } from "../../types/student-context.types";

const formatElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${minutes}:${rest}` : `${minutes}:${rest}`;
};

const ManualFocusSession = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<StudentSubjectAssignment | null>(null);
  const [startedAt] = useState(() => new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [topic, setTopic] = useState("");
  const [rating, setRating] = useState(4);
  const [showFinish, setShowFinish] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (!subjectId) return;
    let active = true;

    void getStudentContext()
      .then((context) => {
        if (!active) return;
        const current = context.subjects.find(
          (item) => item.status === "active" && item.subject.id === subjectId,
        ) ?? null;
        setAssignment(current);
        if (!current) setError("Esta materia no está activa en tu contexto académico.");
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "No pude preparar el modo concentración.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [subjectId]);

  const progress = useMemo(() => {
    const target = Math.max(60, plannedMinutes * 60);
    return Math.min(100, elapsedSeconds / target * 100);
  }, [elapsedSeconds, plannedMinutes]);

  const finish = async () => {
    if (!assignment || !subjectId || !user) return;
    setSaving(true);
    setError(null);

    try {
      await createStudySession(user.id, {
        subjectId,
        startedAt: startedAt.toISOString(),
        endedAt: new Date().toISOString(),
        notes: topic.trim()
          ? `Modo concentración: ${topic.trim()}`
          : `Modo concentración: ${assignment.subject.name}`,
        studyMethod: "EduTrack Focus",
        productivityRating: rating,
      });
      navigate("/", { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No pude guardar tu sesión de concentración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-app-bg"><Loader size="lg" showLabel label="Preparando concentración..." /></main>;
  }

  if (!assignment) {
    return (
      <main className="grid min-h-screen place-items-center bg-app-bg px-4">
        <Card padding="lg" className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-content">No pude abrir esta sesión</h1>
          <p className="mt-2 text-sm text-muted">{error ?? "La materia no está disponible."}</p>
          <Button className="mt-5" onClick={() => navigate("/practice")}>Volver a Practicar</Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 text-content sm:px-6 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/practice")} className="flex items-center gap-3 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-bold text-white">ET</span>
            <span>
              <strong className="block text-sm">Modo concentración</strong>
              <small className="text-xs text-muted">Una materia. Un objetivo. Sin ruido.</small>
            </span>
          </button>
          <div className="text-right">
            <strong className="block font-mono text-2xl tracking-[-0.03em] text-content">{formatElapsed(elapsedSeconds)}</strong>
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted">Tiempo enfocado</span>
          </div>
        </header>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>

        <section className="py-10 text-center sm:py-14">
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{assignment.subject.name}</span>
          <h1 className="mx-auto mt-5 max-w-2xl text-[clamp(2.1rem,6vw,4rem)] font-bold leading-[1.03] tracking-[-0.05em]">
            Concéntrate en lo que tienes delante.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
            El cronómetro ya está corriendo. Cuando cierres la sesión, este tiempo se guardará en tu progreso y ayudará a EduTrack a entender mejor tu ritmo.
          </p>
        </section>

        <Card padding="lg">
          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="grid gap-2 text-sm font-semibold text-content">
              ¿Qué vas a trabajar? <span className="font-normal text-muted">(opcional)</span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Ej. navegación en MAUI, normalización, práctica del capítulo 4..."
                className="min-h-12 rounded-control border border-border bg-app-bg px-4 text-content outline-none focus:border-primary"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-content">
              Meta
              <select
                value={plannedMinutes}
                onChange={(event) => setPlannedMinutes(Number(event.target.value))}
                className="min-h-12 rounded-control border border-border bg-app-bg px-3 text-content"
              >
                <option value={15}>15 min</option>
                <option value={25}>25 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </label>
          </div>
        </Card>

        <section className="mt-8 border-t border-border pt-8">
          {!showFinish ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="prototype-eyebrow">Cuando termines</span>
                <h2 className="mt-1 text-xl font-bold">Guarda el tiempo real que estudiaste.</h2>
              </div>
              <Button size="lg" onClick={() => setShowFinish(true)}>Terminar sesión</Button>
            </div>
          ) : (
            <Card padding="lg">
              <h2 className="text-xl font-bold text-content">¿Cómo te fue?</h2>
              <p className="mt-1 text-sm text-muted">Tu respuesta ayuda a interpretar esta sesión, no cambia el tiempo registrado.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  { value: 2, label: "Me costó" },
                  { value: 4, label: "Avancé bien" },
                  { value: 5, label: "Muy productiva" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRating(option.value)}
                    className={`rounded-2xl border p-4 text-sm font-semibold transition ${rating === option.value ? "border-primary bg-primary/10 text-primary" : "border-border text-content hover:border-primary/30"}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {error && <p className="mt-4 text-sm text-danger">{error}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowFinish(false)}>Seguir estudiando</Button>
                <Button loading={saving} onClick={() => void finish()}>Guardar sesión</Button>
              </div>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
};

export default ManualFocusSession;
