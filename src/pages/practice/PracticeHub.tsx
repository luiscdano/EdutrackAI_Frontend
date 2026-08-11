import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { getStudyPlan } from "../../services/adaptive.service";
import { getQuizzes, startQuizAttempt } from "../../services/quiz.service";
import { getStudentContext } from "../../services/student-context.service";
import type { StudyPlanActivity } from "../../types/adaptive.types";
import type { QuizSummary } from "../../types/quiz.types";

const activityName = (value: string) => {
  const labels: Record<string, string> = {
    exam_preparation: "Preparación",
    quiz_review: "Práctica",
    topic_review: "Repaso",
    study_session: "Enfoque",
  };
  return labels[value] ?? "Actividad";
};

const PracticeHub = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<StudyPlanActivity[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [activeSubjectIds, setActiveSubjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextPlan, nextQuizzes, context] = await Promise.all([
        getStudyPlan(false),
        getQuizzes(),
        getStudentContext(),
      ]);
      setPlan(nextPlan);
      setQuizzes(nextQuizzes.filter((quiz) => quiz.isActive));
      setActiveSubjectIds(
        context.subjects
          .filter((item) => item.status === "active")
          .map((item) => item.subject.id),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pude cargar tus prácticas.");
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

  const availableQuizzes = useMemo(
    () => quizzes.filter((quiz) => activeSubjectIds.includes(quiz.subject.id)),
    [activeSubjectIds, quizzes],
  );

  const recommended = plan[0] ?? null;
  const secondaryPlan = plan.slice(1, 4);

  const startQuiz = async (quiz: QuizSummary) => {
    if (startingId) return;
    setStartingId(quiz.id);
    try {
      const attempt = await startQuizAttempt(quiz.id);
      navigate(`/quizzes/attempts/${attempt.id}`);
    } catch (startError) {
      window.alert(startError instanceof Error ? startError.message : "No pude iniciar la práctica.");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader showLabel label="Preparando prácticas..." /></div>;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 pb-8">
      <header>
        <span className="prototype-eyebrow">Practicar</span>
        <h1 className="mt-1 text-[clamp(1.8rem,4vw,2.7rem)] font-bold tracking-[-0.04em] text-content">Entra, practica y sigue con tu día.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">EduTrack pone primero lo que puede darte más resultado. También puedes elegir cualquier materia cuando quieras.</p>
      </header>

      {error && <Card padding="md" className="border-danger/30"><p className="text-sm text-danger">{error}</p><Button className="mt-3" size="sm" onClick={() => void load()}>Reintentar</Button></Card>}

      {recommended && (
        <section className="rounded-[28px] border border-primary/25 bg-gradient-to-br from-primary/15 via-surface to-surface p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/12 px-3 py-1.5 text-xs font-bold text-primary">Recomendado ahora</span>
                <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs text-muted">{recommended.durationMinutes} min</span>
                <span className="rounded-full bg-surface-muted px-3 py-1.5 text-xs text-muted">{activityName(recommended.activityType)}</span>
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-content">{recommended.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{recommended.subject.name}</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{recommended.reason}</p>
            </div>
            <Button size="lg" onClick={() => navigate(`/focus/${recommended.id}`)}>Empezar ahora</Button>
          </div>
        </section>
      )}

      {secondaryPlan.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-content">Después</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {secondaryPlan.map((activity) => (
              <button key={activity.id} type="button" onClick={() => navigate(`/focus/${activity.id}`)} className="text-left">
                <Card padding="md" className="h-full transition hover:-translate-y-0.5 hover:border-primary/30">
                  <span className="text-xs font-semibold text-primary">{activity.subject.name}</span>
                  <h3 className="mt-2 font-bold text-content">{activity.title}</h3>
                  <p className="mt-3 text-xs text-muted">{activity.durationMinutes} min · {activityName(activity.activityType)}</p>
                </Card>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Prácticas rápidas</span>
            <h2 className="mt-1 text-xl font-bold text-content">Elige una materia</h2>
          </div>
          <button type="button" onClick={() => navigate("/subjects")} className="text-sm font-semibold text-primary">Gestionar materias</button>
        </div>

        {availableQuizzes.length === 0 ? (
          <Card padding="lg" className="text-center">
            <h3 className="text-xl font-bold text-content">Aún no hay quizzes para tus materias</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">Puedes continuar con el repaso recomendado o explorar recursos reales desde cada materia mientras se agregan más prácticas.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableQuizzes.map((quiz) => (
              <Card key={quiz.id} padding="md" className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">{quiz.subject.name}</span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] text-muted">{quiz.difficulty}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-content">{quiz.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted">{quiz.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted">{quiz.timeLimitMinutes} min</span>
                  <Button size="sm" loading={startingId === quiz.id} onClick={() => void startQuiz(quiz)}>Practicar</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PracticeHub;
