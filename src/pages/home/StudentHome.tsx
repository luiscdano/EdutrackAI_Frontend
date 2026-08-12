import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../context/AuthContext";
import { askCopilot, getCopilotPulse } from "../../services/copilot.service";
import type { CopilotPulse, CopilotReply } from "../../types/copilot.types";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
};

const dateLabel = () =>
  new Intl.DateTimeFormat("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

const StudentHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pulse, setPulse] = useState<CopilotPulse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<CopilotReply | null>(null);
  const [asking, setAsking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCopilotPulse();
      if (!result.context?.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
        return;
      }
      setPulse(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No pude preparar tu inicio.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const ask = async (text = question) => {
    const clean = text.trim();
    if (!clean || asking) return;
    setQuestion(clean);
    setAsking(true);
    try {
      setReply(await askCopilot(clean));
    } catch (askError) {
      setReply({
        answer: askError instanceof Error ? askError.message : "No pude responder ahora mismo.",
        action: null,
        suggestedPrompts: pulse?.suggestedPrompts ?? [],
      });
    } finally {
      setAsking(false);
    }
  };

  const openReplyAction = () => {
    if (reply?.resourceDiscovery) {
      const params = new URLSearchParams({ subject: reply.resourceDiscovery.subjectId });
      if (reply.resourceDiscovery.topic) params.set("topic", reply.resourceDiscovery.topic);
      navigate(`/resources?${params.toString()}`);
      return;
    }
    if (reply?.action) navigate(`/focus/${reply.action.activityId}`);
  };

  if (loading) {
    return <div className="grid min-h-[65vh] place-items-center"><Loader size="lg" showLabel label="Preparando tu día..." /></div>;
  }

  if (error || !pulse) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Card padding="lg" className="max-w-lg text-center">
          <h1 className="text-2xl font-bold text-content">No pude preparar tu inicio</h1>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Button className="mt-5" onClick={() => void load()}>Intentar otra vez</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 pb-8">
      <header className="pt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-muted capitalize">{dateLabel()}</span>
        <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-[clamp(1.65rem,3vw,2.35rem)] font-bold leading-tight tracking-[-0.04em] text-content">
              {greeting()}, {user?.firstName}.
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {pulse.context?.programName} · Período {pulse.context?.currentPeriod}
            </p>
          </div>
          <button type="button" onClick={() => navigate("/capture")} className="hidden text-xs font-semibold text-primary sm:block">
            ¿Cambió algo? Añádelo →
          </button>
        </div>
      </header>

      <section className="overflow-hidden rounded-[24px] border border-primary/25 bg-gradient-to-br from-primary/16 via-surface to-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-[11px] font-bold text-primary">Tu siguiente paso</span>
            <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.045em] text-content">
              {pulse.headline}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">{pulse.message}</p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {pulse.action ? (
              <Button onClick={() => navigate(`/focus/${pulse.action?.activityId}`)}>
                {pulse.action.label}
              </Button>
            ) : (
              <Button onClick={() => navigate("/practice")}>Practicar ahora</Button>
            )}
            <Button variant="secondary" onClick={() => navigate("/subjects")}>Mis materias</Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card padding="lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="prototype-eyebrow">Pregúntale a EduTrack</span>
              <h2 className="mt-1 text-lg font-bold text-content sm:text-xl">No busques entre menús. Pregunta.</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Uso tus materias, evaluaciones, prácticas y progreso para darte una acción concreta.</p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary/12 text-sm font-bold text-primary">AI</span>
          </div>

          <div className="mt-4 flex gap-2 rounded-2xl border border-border bg-app-bg p-2 focus-within:border-primary/60">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void ask();
              }}
              placeholder="Ej. Tengo 30 minutos, ¿qué estudio?"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-content outline-none placeholder:text-muted"
            />
            <Button size="sm" loading={asking} onClick={() => void ask()}>Preguntar</Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {pulse.suggestedPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void ask(prompt)}
                className="rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted transition hover:border-primary/35 hover:text-content"
              >
                {prompt}
              </button>
            ))}
          </div>

          {reply && (
            <div className="mt-4 rounded-2xl bg-primary/8 p-4">
              <p className="text-sm leading-6 text-content">{reply.answer}</p>
              {(reply.action || reply.resourceDiscovery) && (
                <Button className="mt-3" size="sm" onClick={openReplyAction}>
                  {reply.resourceDiscovery ? "Ver recursos del tema" : reply.action?.label ?? "Continuar"}
                </Button>
              )}
            </div>
          )}
        </Card>

        <Card padding="lg">
          <span className="prototype-eyebrow">Lo próximo</span>
          {pulse.upcomingEvaluation ? (
            <div className="mt-2">
              <span className="text-3xl font-bold tracking-[-0.04em] text-content">
                {pulse.upcomingEvaluation.daysUntil === 0 ? "Hoy" : `${pulse.upcomingEvaluation.daysUntil}d`}
              </span>
              <h2 className="mt-2 text-lg font-bold text-content">{pulse.upcomingEvaluation.title}</h2>
              <p className="mt-1 text-sm text-muted">{pulse.upcomingEvaluation.subject.name}</p>
              <p className="mt-3 text-xs leading-5 text-muted">
                {new Intl.DateTimeFormat("es-DO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }).format(new Date(pulse.upcomingEvaluation.scheduledAt))}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <h2 className="text-lg font-bold text-content">Sin fechas urgentes</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Si tienes un parcial o entrega que aún no conozco, añádelo y reajusto tu siguiente paso.</p>
              <Button className="mt-3" size="sm" variant="secondary" onClick={() => navigate("/capture")}>Añadir una fecha</Button>
            </div>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <span className="prototype-eyebrow">Esta semana</span>
            <h2 className="mt-1 text-base font-bold text-content sm:text-lg">Solo lo necesario para saber que avanzas</h2>
          </div>
          <button type="button" onClick={() => navigate("/progress")} className="text-sm font-semibold text-primary">Ver progreso</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card padding="md">
            <span className="text-xs text-muted">Tiempo enfocado</span>
            <strong className="mt-2 block text-2xl tracking-[-0.04em] text-content">{pulse.week.studyMinutes} min</strong>
            <span className="mt-1 block text-xs text-muted">{pulse.week.studySessions} sesiones</span>
          </Card>
          <Card padding="md">
            <span className="text-xs text-muted">Prácticas</span>
            <strong className="mt-2 block text-2xl tracking-[-0.04em] text-content">{pulse.week.quizAttempts}</strong>
            <span className="mt-1 block text-xs text-muted">{pulse.week.quizAttempts ? `${pulse.week.quizScore.toFixed(0)}% promedio` : "Empieza cuando quieras"}</span>
          </Card>
          <Card padding="md">
            <span className="text-xs text-muted">Constancia</span>
            <strong className="mt-2 block text-2xl tracking-[-0.04em] text-content">{pulse.week.streakDays} días</strong>
            <span className="mt-1 block text-xs text-muted">Racha actual</span>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default StudentHome;
