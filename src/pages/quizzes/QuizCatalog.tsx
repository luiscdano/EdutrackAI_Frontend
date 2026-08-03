import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getMyQuizAttempts, getQuizzes, startQuizAttempt } from "../../services/quiz.service";
import type { QuizAttemptSummary, QuizSummary } from "../../types/quiz.types";

const formatDate = (value: string) => new Date(value).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });

const QuizCatalog = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [tab, setTab] = useState<"catalog" | "history">("catalog");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizSummary | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextQuizzes, nextAttempts] = await Promise.all([getQuizzes(), getMyQuizAttempts()]);
      setQuizzes(nextQuizzes.filter((quiz) => quiz.isActive));
      setAttempts(nextAttempts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las prácticas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const subjects = useMemo(() => Array.from(new Map(quizzes.map((quiz) => [quiz.subject.id, quiz.subject])).values()), [quizzes]);
  const difficulties = useMemo(() => Array.from(new Set(quizzes.map((quiz) => quiz.difficulty))).sort(), [quizzes]);
  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const text = `${quiz.title} ${quiz.description} ${quiz.subject.name}`.toLowerCase();
    return text.includes(search.trim().toLowerCase()) && (subjectId === "all" || quiz.subject.id === subjectId) && (difficulty === "all" || quiz.difficulty === difficulty);
  }), [difficulty, quizzes, search, subjectId]);

  const start = async (quiz: QuizSummary) => {
    if (startingId) return;
    setStartingId(quiz.id);

    try {
      const attempt = await startQuizAttempt(quiz.id);
      navigate(`/quizzes/attempts/${attempt.id}`);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible iniciar el quiz.");
      setStartingId(null);
    }
  };

  return (
    <ContentShell title="Prácticas académicas" description="Consulta quizzes disponibles, revisa sus reglas y continúa intentos pendientes." loading={loading} error={error} onRetry={() => void load()}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Secciones de prácticas">
        <Button size="sm" variant={tab === "catalog" ? "primary" : "outline"} onClick={() => setTab("catalog")}>Catálogo ({quizzes.length})</Button>
        <Button size="sm" variant={tab === "history" ? "primary" : "outline"} onClick={() => setTab("history")}>Mi historial ({attempts.length})</Button>
      </div>

      {tab === "catalog" ? (
        <>
          <Card padding="md">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-2 text-sm text-muted"><span>Buscar</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Título, descripción o materia" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" /></label>
              <label className="space-y-2 text-sm text-muted"><span>Materia</span><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Todas</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
              <label className="space-y-2 text-sm text-muted"><span>Dificultad</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="all">Todas</option>{difficulties.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
          </Card>

          {filtered.length === 0 ? <Card padding="lg" className="text-center"><h3 className="text-xl font-bold text-content">No hay prácticas disponibles</h3><p className="mt-2 text-muted">Cambia los filtros o consulta más adelante.</p></Card> : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((quiz) => (
                <Card key={quiz.id} padding="md" className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-primary">{quiz.subject.name}</p><h3 className="mt-1 text-xl font-bold text-content">{quiz.title}</h3></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{quiz.difficulty}</span></div>
                  <p className="mt-3 line-clamp-3 text-sm text-muted">{quiz.description}</p>
                  <dl className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-control bg-surface-muted p-3"><dt className="text-muted">Preguntas</dt><dd className="mt-1 font-bold text-content">{quiz._count.question}</dd></div><div className="rounded-control bg-surface-muted p-3"><dt className="text-muted">Tiempo</dt><dd className="mt-1 font-bold text-content">{quiz.timeLimitMinutes} min</dd></div><div className="rounded-control bg-surface-muted p-3"><dt className="text-muted">Intentos</dt><dd className="mt-1 font-bold text-content">{quiz._count.quizziesAttempts}</dd></div></dl>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5"><Button size="sm" variant="outline" onClick={() => setSelectedQuiz(selectedQuiz?.id === quiz.id ? null : quiz)}>{selectedQuiz?.id === quiz.id ? "Ocultar reglas" : "Ver detalle"}</Button><Button size="sm" loading={startingId === quiz.id} disabled={quiz._count.question === 0 || Boolean(startingId)} onClick={() => void start(quiz)}>Iniciar práctica</Button></div>
                  {selectedQuiz?.id === quiz.id && <div className="mt-4 rounded-control border border-border p-4 text-sm text-muted"><p className="font-semibold text-content">Antes de comenzar</p><ul className="mt-2 list-disc space-y-1 pl-5"><li>El tiempo inicia al abrir el intento.</li><li>Puedes cambiar respuestas antes de finalizar.</li><li>Las respuestas correctas aparecen solo al terminar.</li><li>Si recargas la página, el intento se recuperará.</li></ul></div>}
                </Card>
              ))}
            </div>
          )}
        </>
      ) : attempts.length === 0 ? <Card padding="lg" className="text-center"><h3 className="text-xl font-bold text-content">Todavía no tienes intentos</h3><p className="mt-2 text-muted">Inicia una práctica para comenzar tu historial.</p></Card> : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <Card key={attempt.id} padding="md"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-primary">{attempt.quizzies.subject?.name ?? "Quiz"}</p><h3 className="mt-1 text-lg font-bold text-content">{attempt.quizzies.title}</h3><p className="mt-2 text-sm text-muted">Iniciado: {formatDate(attempt.startedAt)}{attempt.finishedAt ? ` · Finalizado: ${formatDate(attempt.finishedAt)}` : " · En progreso"}</p></div><div className="flex flex-wrap items-center gap-3"><div className="text-right"><p className="text-xs text-muted">Puntuación</p><p className="text-2xl font-bold text-content">{attempt.isFinished ? Number(attempt.score).toFixed(1) : "—"}</p></div><Button size="sm" variant={attempt.isFinished ? "outline" : "primary"} onClick={() => navigate(`/quizzes/attempts/${attempt.id}`)}>{attempt.isFinished ? "Revisar" : "Continuar"}</Button></div></div></Card>
          ))}
        </div>
      )}
    </ContentShell>
  );
};

export default QuizCatalog;
