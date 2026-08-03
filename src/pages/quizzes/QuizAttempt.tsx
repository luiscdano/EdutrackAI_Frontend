import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { finishQuizAttempt, getQuizAttempt, saveQuizAnswer } from "../../services/quiz.service";
import type { QuizAttemptDetail, QuizQuestion } from "../../types/quiz.types";

const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
};

const QuizAttempt = () => {
  const { attemptId = "" } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const load = useCallback(async () => {
    if (!attemptId) {
      setError("El intento solicitado no es válido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getQuizAttempt(attemptId);
      setAttempt(data);
      setRemainingSeconds(Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)));
      const firstPending = data.questions.findIndex((question) => !question.selectedOptionId);
      setCurrentIndex(firstPending >= 0 ? firstPending : 0);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar el intento.");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  useEffect(() => {
    if (!attempt || attempt.isFinished) return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attempt]);

  const answeredCount = useMemo(() => attempt?.questions.filter((question) => Boolean(question.selectedOptionId)).length ?? 0, [attempt]);
  const currentQuestion = attempt?.questions[currentIndex];

  const selectOption = async (question: QuizQuestion, optionId: string) => {
    if (!attempt || attempt.isFinished || remainingSeconds === 0 || savingQuestionId) return;
    setSavingQuestionId(question.id);

    setAttempt((current) => current ? {
      ...current,
      questions: current.questions.map((item) => item.id === question.id ? { ...item, selectedOptionId: optionId } : item),
    } : current);

    try {
      await saveQuizAnswer(attempt.id, question.id, optionId);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible guardar la respuesta.");
      await load();
    } finally {
      setSavingQuestionId(null);
    }
  };

  const finish = async () => {
    if (!attempt || attempt.isFinished || finishing) return;
    const missing = attempt.questions.length - answeredCount;
    const question = missing > 0 ? `Faltan ${missing} respuesta(s). ¿Deseas finalizar de todos modos?` : "¿Deseas finalizar y enviar el quiz?";
    if (!window.confirm(question)) return;

    setFinishing(true);

    try {
      const result = await finishQuizAttempt(attempt.id);
      setAttempt(result);
      setRemainingSeconds(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible finalizar el quiz.");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <ContentShell title={attempt?.quizzies.title ?? "Realizar quiz"} description={attempt?.isFinished ? "Revisa tu puntuación y las respuestas del intento." : "Selecciona una respuesta por pregunta y finaliza cuando estés lista."} onBack={() => navigate("/practices")} loading={loading} error={error} onRetry={() => void load()}>
      {attempt && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card padding="md"><p className="text-sm text-muted">Materia</p><p className="mt-2 font-bold text-content">{attempt.quizzies.subject?.name ?? "No indicada"}</p></Card>
            <Card padding="md"><p className="text-sm text-muted">Progreso</p><p className="mt-2 text-2xl font-bold text-content">{answeredCount}/{attempt.questions.length}</p></Card>
            <Card padding="md"><p className="text-sm text-muted">Tiempo restante</p><p className={`mt-2 text-2xl font-bold ${remainingSeconds <= 60 && !attempt.isFinished ? "text-danger" : "text-content"}`}>{attempt.isFinished ? "Finalizado" : formatTime(remainingSeconds)}</p></Card>
            <Card padding="md"><p className="text-sm text-muted">Estado</p><p className="mt-2 font-bold text-content">{attempt.isFinished ? "Completado" : remainingSeconds === 0 ? "Tiempo agotado" : "En progreso"}</p></Card>
          </section>

          {attempt.isFinished ? (
            <>
              <Card padding="lg" className="text-center"><p className="text-sm font-semibold uppercase tracking-wider text-primary">Resultado</p><p className="mt-3 text-5xl font-bold text-content">{Number(attempt.score).toFixed(1)}</p><p className="mt-2 text-muted">{attempt.correctAnswers} respuestas correctas de {attempt.totalQuestion}</p></Card>
              <div className="space-y-4">
                {attempt.questions.map((question, index) => {
                  const selected = question.questionOptions.find((option) => option.id === question.selectedOptionId);
                  const correct = question.questionOptions.find((option) => option.isCorrect);
                  const wasCorrect = selected?.isCorrect === true;
                  return <Card key={question.id} padding="md" className={wasCorrect ? "border-success/50" : "border-danger/50"}><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-content">{index + 1}. {question.questionText}</h3><span className={`rounded-full px-3 py-1 text-xs font-semibold ${wasCorrect ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>{wasCorrect ? "Correcta" : "Incorrecta"}</span></div><p className="mt-3 text-sm text-muted">Tu respuesta: <span className="text-content">{selected?.optionText ?? "Sin respuesta"}</span></p>{!wasCorrect && <p className="mt-2 text-sm text-muted">Respuesta correcta: <span className="text-success">{correct?.optionText ?? "No disponible"}</span></p>}<p className="mt-2 text-xs text-muted">Valor: {question.points} punto(s)</p></Card>;
                })}
              </div>
              <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" onClick={() => navigate("/practices")}>Volver al historial</Button></div>
            </>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
              <Card padding="md" className="h-fit xl:sticky xl:top-28"><h3 className="font-bold text-content">Preguntas</h3><div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 xl:grid-cols-4">{attempt.questions.map((question, index) => <button key={question.id} type="button" onClick={() => setCurrentIndex(index)} className={`grid min-h-11 place-items-center rounded-control border text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === currentIndex ? "border-primary bg-primary text-white" : question.selectedOptionId ? "border-success/50 bg-success/10 text-success" : "border-border text-muted hover:bg-white/10"}`} aria-label={`Ir a la pregunta ${index + 1}`}>{index + 1}</button>)}</div></Card>

              {currentQuestion && <Card padding="lg"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-semibold text-primary">Pregunta {currentIndex + 1} de {attempt.questions.length}</p><span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{currentQuestion.points} punto(s)</span></div><h3 className="mt-4 text-xl font-bold leading-relaxed text-content">{currentQuestion.questionText}</h3><div className="mt-6 space-y-3" role="radiogroup" aria-label={`Opciones para la pregunta ${currentIndex + 1}`}>{currentQuestion.questionOptions.map((option) => { const selected = currentQuestion.selectedOptionId === option.id; return <button key={option.id} type="button" role="radio" aria-checked={selected} disabled={remainingSeconds === 0 || Boolean(savingQuestionId)} onClick={() => void selectOption(currentQuestion, option.id)} className={`flex min-h-14 w-full items-center gap-3 rounded-control border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? "border-primary bg-primary/10 text-content" : "border-border text-muted hover:bg-white/5 hover:text-content"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-primary bg-primary" : "border-border"}`}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span><span>{option.optionText}</span></button>; })}</div><div className="mt-7 flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}>Anterior</Button><div className="flex flex-wrap gap-3">{currentIndex < attempt.questions.length - 1 && <Button variant="secondary" onClick={() => setCurrentIndex((value) => Math.min(attempt.questions.length - 1, value + 1))}>Siguiente</Button>}<Button variant="primary" loading={finishing} onClick={() => void finish()}>{remainingSeconds === 0 ? "Enviar respuestas" : "Finalizar quiz"}</Button></div></div></Card>}
            </div>
          )}
        </>
      )}
    </ContentShell>
  );
};

export default QuizAttempt;
