import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { getStudyPlanActivity, updateStudyPlanActivity } from "../../services/adaptive.service";
import { discoverLearningResources } from "../../services/learning-resources.service";
import { getQuizzes, startQuizAttempt } from "../../services/quiz.service";
import { createStudySession } from "../../services/study-session.service";
import type { StudyPlanActivity } from "../../types/adaptive.types";
import type { LearningResource } from "../../types/student-context.types";
import type { QuizSummary } from "../../types/quiz.types";

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
};

const FocusSession = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const { user } = useAuth();
  const [activity, setActivity] = useState<StudyPlanActivity | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [quiz, setQuiz] = useState<QuizSummary | null>(null);
  const [startedAt] = useState(() => new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [rating, setRating] = useState(4);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (!activityId) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let nextActivity = await getStudyPlanActivity(activityId);
        if (nextActivity.status === "pending") {
          nextActivity = await updateStudyPlanActivity(activityId, { status: "in_progress" });
        }

        const [discovery, quizzes] = await Promise.all([
          discoverLearningResources(nextActivity.subject.id, nextActivity.topic ?? undefined).catch(() => null),
          getQuizzes().catch(() => []),
        ]);

        if (!active) return;
        setActivity(nextActivity);
        setResources(discovery?.resources ?? []);
        setQuiz(quizzes.find((item) => item.isActive && item.subject.id === nextActivity.subject.id) ?? null);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "No pude abrir esta sesión.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [activityId]);

  const progress = useMemo(() => {
    if (!activity) return 0;
    const plannedSeconds = Math.max(60, activity.durationMinutes * 60);
    return Math.min(100, elapsedSeconds / plannedSeconds * 100);
  }, [activity, elapsedSeconds]);

  const startQuiz = async () => {
    if (!quiz) return;
    try {
      const attempt = await startQuizAttempt(quiz.id);
      navigate(`/quizzes/attempts/${attempt.id}`);
    } catch (quizError) {
      window.alert(quizError instanceof Error ? quizError.message : "No pude iniciar el quiz.");
    }
  };

  const finish = async () => {
    if (!activity || !activityId || !user) return;
    setFinishing(true);
    setError(null);
    const endedAt = new Date();

    try {
      await createStudySession(user.id, {
        subjectId: activity.subject.id,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        notes: `Sesión Focus: ${activity.title}`,
        studyMethod: "EduTrack Focus",
        productivityRating: rating,
      });
      await updateStudyPlanActivity(activityId, { status: "completed" }).catch(() => null);
      navigate("/", { replace: true });
    } catch (finishError) {
      setError(finishError instanceof Error ? finishError.message : "No pude guardar tu sesión.");
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-app-bg"><Loader size="lg" showLabel label="Preparando Focus..." /></main>;
  }

  if (error && !activity) {
    return (
      <main className="grid min-h-screen place-items-center bg-app-bg px-4">
        <Card padding="lg" className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-content">No pude abrir esta sesión</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Button className="mt-5" onClick={() => navigate("/practice")}>Volver a Practicar</Button>
        </Card>
      </main>
    );
  }

  if (!activity) return null;

  return (
    <main className="min-h-screen bg-app-bg px-4 py-5 text-content sm:px-6 lg:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/practice")} className="flex items-center gap-3 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-bold text-white">ET</span>
            <span>
              <strong className="block text-sm">Focus</strong>
              <small className="text-xs text-muted">Una cosa a la vez</small>
            </span>
          </button>
          <div className="text-right">
            <strong className="block font-mono text-xl tracking-[-0.03em] text-content">{formatElapsed(elapsedSeconds)}</strong>
            <span className="text-[10px] uppercase tracking-[0.1em] text-muted">{activity.durationMinutes} min sugeridos</span>
          </div>
        </header>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>

        <section className="py-10 text-center sm:py-14">
          <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{activity.subject.name}</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.2rem,6vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.055em]">{activity.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">{activity.reason}</p>
          {activity.topic && <p className="mt-3 text-sm font-semibold text-primary">Tema: {activity.topic}</p>}
        </section>

        <section className="grid gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="prototype-eyebrow">1 · Entender</span>
              <h2 className="mt-1 text-xl font-bold">Elige una explicación que te funcione</h2>
            </div>
          </div>

          {resources.length === 0 ? (
            <Card padding="md"><p className="text-sm text-muted">No encontré recursos externos para este tema todavía. Puedes continuar con una práctica o registrar el repaso con tus materiales de clase.</p></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {resources.slice(0, 6).map((resource) => (
                <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="group block">
                  <Card padding="md" className="h-full transition group-hover:-translate-y-0.5 group-hover:border-primary/35">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-primary">{resource.provider}</span>
                      {resource.verifiedProvider && <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">Fuente real</span>}
                    </div>
                    <h3 className="mt-3 font-bold leading-5 text-content">{resource.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted">{resource.description}</p>
                    <span className="mt-4 block text-xs font-semibold text-primary">Abrir recurso ↗</span>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[26px] border border-border bg-surface p-5 sm:p-6">
          <span className="prototype-eyebrow">2 · Comprobar</span>
          <div className="mt-2 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-content">¿Ya te hace más sentido?</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Una práctica corta te dice más que releer el mismo contenido.</p>
            </div>
            {quiz ? (
              <Button variant="secondary" onClick={() => void startQuiz()}>Hacer práctica rápida</Button>
            ) : (
              <Button variant="secondary" onClick={() => navigate(`/resources?subject=${activity.subject.id}${activity.topic ? `&topic=${encodeURIComponent(activity.topic)}` : ""}`)}>Ver más recursos</Button>
            )}
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-8">
          {!showFinish ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="prototype-eyebrow">3 · Cerrar</span>
                <h2 className="mt-1 text-xl font-bold">Cuando termines, EduTrack vuelve a ajustar tu siguiente paso.</h2>
              </div>
              <Button size="lg" onClick={() => setShowFinish(true)}>Terminé este repaso</Button>
            </div>
          ) : (
            <Card padding="lg">
              <h2 className="text-xl font-bold text-content">¿Cómo te fue?</h2>
              <p className="mt-1 text-sm text-muted">Una respuesta rápida. Esto ayuda a interpretar tu sesión.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  { value: 2, label: "Todavía me cuesta" },
                  { value: 4, label: "Ya lo entiendo mejor" },
                  { value: 5, label: "Lo tengo claro" },
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
                <Button loading={finishing} onClick={() => void finish()}>Guardar y continuar</Button>
              </div>
            </Card>
          )}
        </section>
      </div>
    </main>
  );
};

export default FocusSession;
