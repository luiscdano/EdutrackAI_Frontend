import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import ContentShell from "../../components/content/ContentShell";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { getSubjects } from "../../services/content.service";
import {
  createQuestion,
  createQuestionOption,
  createQuiz,
  deleteQuestion,
  deleteQuestionOption,
  deleteQuiz,
  getQuizQuestions,
  getQuizzes,
  updateQuestion,
  updateQuestionOption,
  updateQuiz,
} from "../../services/quiz.service";
import type { ContentSubject } from "../../types/content.types";
import type { QuizOption, QuizPayload, QuizQuestion, QuizSummary } from "../../types/quiz.types";

const emptyQuiz: QuizPayload = { subjectId: "", title: "", description: "", difficulty: "Intermedio", timeLimitMinutes: 20, isActive: false };
const emptyQuestion = { questionText: "", questionType: "multiple-choice", points: 1, topic: "", difficulty: "Intermedio" };

const questionIsReady = (question: QuizQuestion) =>
  question.questionOptions.length >= 2 && question.questionOptions.some((option) => Boolean(option.isCorrect));

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [subjects, setSubjects] = useState<ContentSubject[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quizModal, setQuizModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizSummary | null>(null);
  const [quizForm, setQuizForm] = useState<QuizPayload>(emptyQuiz);
  const [questionModal, setQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [optionsQuestion, setOptionsQuestion] = useState<QuizQuestion | null>(null);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, { optionText: string; isCorrect: boolean }>>({});
  const [newOptionText, setNewOptionText] = useState("");
  const [newOptionCorrect, setNewOptionCorrect] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedQuiz = quizzes.find((quiz) => quiz.id === selectedQuizId) ?? null;
  const quizReady = questions.length > 0 && questions.every(questionIsReady);
  const incompleteQuestions = questions.filter((question) => !questionIsReady(question)).length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [quizData, subjectData] = await Promise.all([getQuizzes(), getSubjects()]);
      setQuizzes(quizData);
      setSubjects(subjectData.filter((subject) => subject.isActive));
      setSelectedQuizId((current) => current && quizData.some((quiz) => quiz.id === current) ? current : quizData[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!selectedQuizId) {
      setQuestions([]);
      return;
    }

    setQuestionsLoading(true);
    try {
      setQuestions(await getQuizQuestions(selectedQuizId));
    } catch (loadError) {
      window.alert(loadError instanceof Error ? loadError.message : "No fue posible cargar las preguntas.");
    } finally {
      setQuestionsLoading(false);
    }
  }, [selectedQuizId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadQuestions(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadQuestions]);

  const filtered = useMemo(
    () => quizzes.filter((quiz) => `${quiz.title} ${quiz.subject.name} ${quiz.difficulty}`.toLowerCase().includes(search.trim().toLowerCase())),
    [quizzes, search],
  );

  const openQuizForm = (quiz?: QuizSummary) => {
    setEditingQuiz(quiz ?? null);
    setQuizForm(
      quiz
        ? { subjectId: quiz.subject.id, title: quiz.title, description: quiz.description, difficulty: quiz.difficulty, timeLimitMinutes: quiz.timeLimitMinutes, isActive: quiz.isActive }
        : { ...emptyQuiz, subjectId: subjects[0]?.id ?? "" },
    );
    setQuizModal(true);
  };

  const submitQuiz = async (event: FormEvent) => {
    event.preventDefault();

    if (editingQuiz && quizForm.isActive && !quizReady) {
      window.alert("Antes de publicar, cada pregunta necesita al menos dos opciones y una respuesta correcta.");
      return;
    }

    setSaving(true);
    try {
      const result = editingQuiz
        ? await updateQuiz(editingQuiz.id, { title: quizForm.title, description: quizForm.description, difficulty: quizForm.difficulty, timeLimitMinutes: quizForm.timeLimitMinutes, isActive: quizForm.isActive })
        : await createQuiz({ ...quizForm, isActive: false });
      setQuizzes((current) => editingQuiz ? current.map((quiz) => quiz.id === result.id ? result : quiz) : [result, ...current]);
      setSelectedQuizId(result.id);
      setQuizModal(false);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible guardar el quiz.");
    } finally {
      setSaving(false);
    }
  };

  const removeQuiz = async (quiz: QuizSummary) => {
    if (!window.confirm(`¿Eliminar el quiz “${quiz.title}”? Si tiene intentos, la API solicitará desactivarlo en su lugar.`)) return;
    try {
      await deleteQuiz(quiz.id);
      setQuizzes((current) => current.filter((item) => item.id !== quiz.id));
      if (selectedQuizId === quiz.id) setSelectedQuizId(null);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible eliminar el quiz.");
    }
  };

  const openQuestionForm = (question?: QuizQuestion) => {
    if (!selectedQuiz) return;
    setEditingQuestion(question ?? null);
    setQuestionForm(question ? { questionText: question.questionText, questionType: question.questionType, points: question.points, topic: question.topic, difficulty: question.difficulty } : { ...emptyQuestion, difficulty: selectedQuiz.difficulty });
    setQuestionModal(true);
  };

  const submitQuestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedQuiz) return;
    setSaving(true);

    try {
      const result = editingQuestion
        ? await updateQuestion(editingQuestion.id, questionForm)
        : await createQuestion({ quizId: selectedQuiz.id, ...questionForm });
      setQuestions((current) => editingQuestion ? current.map((question) => question.id === result.id ? result : question) : [...current, result]);
      setQuestionModal(false);
      await load();
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible guardar la pregunta.");
    } finally {
      setSaving(false);
    }
  };

  const removeQuestion = async (question: QuizQuestion) => {
    if (!window.confirm("¿Eliminar esta pregunta y sus opciones?")) return;
    try {
      await deleteQuestion(question.id);
      setQuestions((current) => current.filter((item) => item.id !== question.id));
      await load();
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible eliminar la pregunta.");
    }
  };

  const openOptions = (question: QuizQuestion) => {
    setOptionsQuestion(question);
    setOptionDrafts(Object.fromEntries(question.questionOptions.map((option) => [option.id, { optionText: option.optionText, isCorrect: Boolean(option.isCorrect) }])));
    setNewOptionText("");
    setNewOptionCorrect(false);
  };

  const addOption = async () => {
    if (!optionsQuestion || !newOptionText.trim()) return;
    setSaving(true);
    try {
      const result = await createQuestionOption(optionsQuestion.id, { questionId: optionsQuestion.id, optionText: newOptionText.trim(), isCorrect: newOptionCorrect });
      setQuestions((current) => current.map((question) => question.id === optionsQuestion.id ? { ...question, questionOptions: [...question.questionOptions, result] } : question));
      setOptionsQuestion((current) => current ? { ...current, questionOptions: [...current.questionOptions, result] } : current);
      setOptionDrafts((current) => ({ ...current, [result.id]: { optionText: result.optionText, isCorrect: Boolean(result.isCorrect) } }));
      setNewOptionText("");
      setNewOptionCorrect(false);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible agregar la opción.");
    } finally {
      setSaving(false);
    }
  };

  const saveOption = async (option: QuizOption) => {
    const draft = optionDrafts[option.id];
    if (!draft) return;
    setSaving(true);
    try {
      const result = await updateQuestionOption(option.id, draft);
      setQuestions((current) => current.map((question) => question.id === optionsQuestion?.id ? { ...question, questionOptions: question.questionOptions.map((item) => item.id === result.id ? result : item) } : question));
      setOptionsQuestion((current) => current ? { ...current, questionOptions: current.questionOptions.map((item) => item.id === result.id ? result : item) } : current);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible actualizar la opción.");
    } finally {
      setSaving(false);
    }
  };

  const removeOption = async (option: QuizOption) => {
    if (!window.confirm("¿Eliminar esta opción?")) return;
    try {
      await deleteQuestionOption(option.id);
      setQuestions((current) => current.map((question) => question.id === optionsQuestion?.id ? { ...question, questionOptions: question.questionOptions.filter((item) => item.id !== option.id) } : question));
      setOptionsQuestion((current) => current ? { ...current, questionOptions: current.questionOptions.filter((item) => item.id !== option.id) } : current);
    } catch (operationError) {
      window.alert(operationError instanceof Error ? operationError.message : "No fue posible eliminar la opción.");
    }
  };

  return (
    <ContentShell
      title="Gestión de quizzes"
      description="Construye quizzes como borradores, completa preguntas y opciones, revisa la vista previa y publica solo cuando estén listos."
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={<Button onClick={() => openQuizForm()}>Nuevo quiz</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card padding="md" className="h-fit xl:sticky xl:top-28">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar quiz" className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content outline-none focus:border-primary" />
          <div className="mt-4 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            {filtered.map((quiz) => (
              <button key={quiz.id} type="button" onClick={() => setSelectedQuizId(quiz.id)} className={`w-full rounded-control border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedQuizId === quiz.id ? "border-primary bg-primary/10" : "border-border hover:bg-white/5"}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-content">{quiz.title}</p>
                  <span className={`text-xs font-semibold ${quiz.isActive ? "text-success" : "text-muted"}`}>{quiz.isActive ? "Publicado" : "Borrador"}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{quiz.subject.name} · {quiz._count.question} pregunta(s)</p>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="mt-5 text-center text-sm text-muted">No hay quizzes.</p>}
        </Card>

        {!selectedQuiz ? (
          <Card padding="lg" className="text-center">
            <h3 className="text-xl font-bold text-content">Selecciona o crea un quiz</h3>
            <p className="mt-2 text-muted">El editor aparecerá en esta sección.</p>
          </Card>
        ) : (
          <div className="space-y-5">
            <Card padding="md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{selectedQuiz.subject.name}</span>
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-muted">{selectedQuiz.difficulty}</span>
                    <span className={selectedQuiz.isActive ? "text-sm font-semibold text-success" : quizReady ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-warning"}>
                      {selectedQuiz.isActive ? "Publicado" : quizReady ? "Listo para publicar" : "Borrador incompleto"}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-content">{selectedQuiz.title}</h3>
                  <p className="mt-2 text-muted">{selectedQuiz.description}</p>
                  <p className="mt-3 text-sm text-muted">{selectedQuiz.timeLimitMinutes} minutos · {selectedQuiz._count.quizziesAttempts} intento(s)</p>
                  {!selectedQuiz.isActive && (
                    <p className="mt-3 text-xs leading-5 text-muted">
                      {quizReady
                        ? "El contenido está completo. Abre Editar para publicarlo."
                        : questions.length === 0
                          ? "Agrega al menos una pregunta y sus opciones antes de publicar."
                          : `${incompleteQuestions} pregunta(s) todavía necesitan al menos dos opciones y una respuesta correcta.`}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>Vista previa</Button>
                  <Button size="sm" variant="secondary" onClick={() => openQuizForm(selectedQuiz)}>Editar</Button>
                  <Button size="sm" variant="danger" onClick={() => void removeQuiz(selectedQuiz)}>Eliminar</Button>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-content">Preguntas</h3>
                <p className="text-sm text-muted">Cada pregunta debe tener al menos dos opciones y una respuesta correcta.</p>
              </div>
              <Button onClick={() => openQuestionForm()}>Agregar pregunta</Button>
            </div>

            {questionsLoading ? (
              <Card padding="lg" className="text-center text-muted">Cargando preguntas...</Card>
            ) : questions.length === 0 ? (
              <Card padding="lg" className="text-center">
                <h4 className="text-lg font-bold text-content">Este quiz todavía no tiene preguntas</h4>
                <p className="mt-2 text-muted">Agrega la primera pregunta para comenzar.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id} padding="md">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">Pregunta {index + 1} · {question.points} punto(s)</p>
                        <h4 className="mt-2 text-lg font-bold text-content">{question.questionText}</h4>
                        <p className="mt-2 text-sm text-muted">{question.topic} · {question.difficulty} · {question.questionType}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {question.questionOptions.map((option) => (
                            <span key={option.id} className={`rounded-full px-3 py-1 text-xs ${option.isCorrect ? "bg-success/10 text-success" : "bg-surface-muted text-muted"}`}>
                              {option.optionText}{option.isCorrect ? " · correcta" : ""}
                            </span>
                          ))}
                        </div>
                        {!questionIsReady(question) && <p className="mt-3 text-xs font-semibold text-warning">Completa las opciones antes de publicar.</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openOptions(question)}>Opciones ({question.questionOptions.length})</Button>
                        <Button size="sm" variant="secondary" onClick={() => openQuestionForm(question)}>Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => void removeQuestion(question)}>Eliminar</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={quizModal} title={editingQuiz ? "Editar quiz" : "Nuevo quiz"} size="lg" onClose={() => setQuizModal(false)} footer={<><Button variant="outline" onClick={() => setQuizModal(false)}>Cancelar</Button><Button type="submit" form="quiz-form" loading={saving}>Guardar</Button></>}>
        <form id="quiz-form" onSubmit={(event) => void submitQuiz(event)} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-muted sm:col-span-2"><span>Materia</span><select required disabled={Boolean(editingQuiz)} value={quizForm.subjectId} onChange={(event) => setQuizForm((current) => ({ ...current, subjectId: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content disabled:opacity-60"><option value="">Seleccionar</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
          <label className="space-y-2 text-sm text-muted sm:col-span-2"><span>Título</span><input required value={quizForm.title} onChange={(event) => setQuizForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted sm:col-span-2"><span>Descripción</span><textarea required rows={4} value={quizForm.description} onChange={(event) => setQuizForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Dificultad</span><input required value={quizForm.difficulty} onChange={(event) => setQuizForm((current) => ({ ...current, difficulty: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Tiempo límite (minutos)</span><input required type="number" min={1} max={600} value={quizForm.timeLimitMinutes} onChange={(event) => setQuizForm((current) => ({ ...current, timeLimitMinutes: Number(event.target.value) }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          {editingQuiz ? (
            <label className={`flex min-h-11 items-center gap-3 text-sm sm:col-span-2 ${!quizReady && !selectedQuiz?.isActive ? "text-muted" : "text-content"}`}>
              <input type="checkbox" disabled={!quizReady && !selectedQuiz?.isActive} checked={quizForm.isActive} onChange={(event) => setQuizForm((current) => ({ ...current, isActive: event.target.checked }))} className="h-5 w-5" />
              Publicar quiz {quizReady ? "· contenido completo" : "· completa primero las preguntas"}
            </label>
          ) : (
            <div className="rounded-control bg-surface-muted px-4 py-3 text-sm text-muted sm:col-span-2">El quiz se guardará como borrador. Después agrega preguntas y opciones; cuando esté completo podrás publicarlo.</div>
          )}
        </form>
      </Modal>

      <Modal isOpen={questionModal} title={editingQuestion ? "Editar pregunta" : "Nueva pregunta"} size="lg" onClose={() => setQuestionModal(false)} footer={<><Button variant="outline" onClick={() => setQuestionModal(false)}>Cancelar</Button><Button type="submit" form="question-form" loading={saving}>Guardar</Button></>}>
        <form id="question-form" onSubmit={(event) => void submitQuestion(event)} className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-muted sm:col-span-2"><span>Pregunta</span><textarea required rows={4} value={questionForm.questionText} onChange={(event) => setQuestionForm((current) => ({ ...current, questionText: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Tipo</span><select value={questionForm.questionType} onChange={(event) => setQuestionForm((current) => ({ ...current, questionType: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content"><option value="multiple-choice">Selección múltiple</option><option value="true-false">Verdadero/Falso</option></select></label>
          <label className="space-y-2 text-sm text-muted"><span>Puntos</span><input required type="number" min={1} max={100} value={questionForm.points} onChange={(event) => setQuestionForm((current) => ({ ...current, points: Number(event.target.value) }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Tema</span><input required value={questionForm.topic} onChange={(event) => setQuestionForm((current) => ({ ...current, topic: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
          <label className="space-y-2 text-sm text-muted"><span>Dificultad</span><input required value={questionForm.difficulty} onChange={(event) => setQuestionForm((current) => ({ ...current, difficulty: event.target.value }))} className="w-full rounded-control border border-border bg-app-bg px-4 py-3 text-content" /></label>
        </form>
      </Modal>

      <Modal isOpen={Boolean(optionsQuestion)} title="Opciones de respuesta" size="lg" onClose={() => setOptionsQuestion(null)} footer={<Button variant="outline" onClick={() => setOptionsQuestion(null)}>Cerrar</Button>}>
        <div className="space-y-5">
          {optionsQuestion?.questionOptions.map((option) => {
            const draft = optionDrafts[option.id] ?? { optionText: option.optionText, isCorrect: Boolean(option.isCorrect) };
            return (
              <div key={option.id} className="grid gap-3 rounded-control border border-border p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
                <input value={draft.optionText} onChange={(event) => setOptionDrafts((current) => ({ ...current, [option.id]: { ...draft, optionText: event.target.value } }))} className="rounded-control border border-border bg-app-bg px-4 py-3 text-content" />
                <label className="flex min-h-11 items-center gap-2 text-sm text-content"><input type="checkbox" checked={draft.isCorrect} onChange={(event) => setOptionDrafts((current) => ({ ...current, [option.id]: { ...draft, isCorrect: event.target.checked } }))} className="h-5 w-5" />Correcta</label>
                <div className="flex gap-2"><Button size="sm" variant="secondary" loading={saving} onClick={() => void saveOption(option)}>Guardar</Button><Button size="sm" variant="danger" onClick={() => void removeOption(option)}>Eliminar</Button></div>
              </div>
            );
          })}
          <div className="border-t border-border pt-5">
            <h4 className="font-bold text-content">Agregar opción</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input value={newOptionText} onChange={(event) => setNewOptionText(event.target.value)} placeholder="Texto de la opción" className="rounded-control border border-border bg-app-bg px-4 py-3 text-content" />
              <label className="flex min-h-11 items-center gap-2 text-sm text-content"><input type="checkbox" checked={newOptionCorrect} onChange={(event) => setNewOptionCorrect(event.target.checked)} className="h-5 w-5" />Correcta</label>
              <Button loading={saving} disabled={!newOptionText.trim()} onClick={() => void addOption()}>Agregar</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={previewOpen} title="Vista previa del quiz" size="xl" onClose={() => setPreviewOpen(false)} footer={<Button variant="outline" onClick={() => setPreviewOpen(false)}>Cerrar</Button>}>
        <div className="space-y-5">
          <div><p className="text-sm font-semibold text-primary">{selectedQuiz?.subject.name}</p><h3 className="mt-2 text-2xl font-bold text-content">{selectedQuiz?.title}</h3><p className="mt-2 text-muted">{selectedQuiz?.description}</p></div>
          {questions.map((question, index) => <Card key={question.id} padding="md"><p className="font-bold text-content">{index + 1}. {question.questionText}</p><div className="mt-4 space-y-2">{question.questionOptions.map((option) => <div key={option.id} className={`rounded-control border p-3 text-sm ${option.isCorrect ? "border-success/50 bg-success/10 text-success" : "border-border text-muted"}`}>{option.optionText}</div>)}</div></Card>)}
        </div>
      </Modal>
    </ContentShell>
  );
};

export default AdminQuizzes;