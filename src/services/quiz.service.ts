import { apiRequest } from "./api-client";
import type {
  OptionPayload,
  QuestionPayload,
  QuizAttemptDetail,
  QuizAttemptSummary,
  QuizOption,
  QuizPayload,
  QuizQuestion,
  QuizSummary,
} from "../types/quiz.types";

export const getQuizzes = () => apiRequest<QuizSummary[]>("/quizzies");
export const getQuiz = (quizId: string) => apiRequest<QuizSummary>(`/quizzies/${quizId}`);
export const getQuizQuestions = (quizId: string) => apiRequest<QuizQuestion[]>(`/questions/by-quiz/${quizId}`);
export const getMyQuizAttempts = () => apiRequest<QuizAttemptSummary[]>("/quizzies/me/attempts");
export const startQuizAttempt = (quizId: string) => apiRequest<QuizAttemptSummary>(`/quizzies/${quizId}/attempts`, { method: "POST" });
export const getQuizAttempt = (attemptId: string) => apiRequest<QuizAttemptDetail>(`/quizzies/attempts/${attemptId}`);
export const saveQuizAnswer = (attemptId: string, questionId: string, selectedOptionId: string) => apiRequest<{ id: string; questionId: string; selectedOptionId: string }>(`/quizzies/attempts/${attemptId}/answers`, {
  method: "POST",
  body: JSON.stringify({ questionId, selectedOptionId }),
});
export const finishQuizAttempt = (attemptId: string) => apiRequest<QuizAttemptDetail>(`/quizzies/attempts/${attemptId}/finish`, { method: "POST" });

export const createQuiz = (payload: QuizPayload) => apiRequest<QuizSummary>("/quizzies", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateQuiz = (quizId: string, payload: Partial<Omit<QuizPayload, "subjectId">>) => apiRequest<QuizSummary>(`/quizzies/${quizId}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteQuiz = (quizId: string) => apiRequest<void>(`/quizzies/${quizId}`, { method: "DELETE" });

export const createQuestion = (payload: QuestionPayload) => apiRequest<QuizQuestion>("/questions", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateQuestion = (questionId: string, payload: Partial<Omit<QuestionPayload, "quizId">>) => apiRequest<QuizQuestion>(`/questions/${questionId}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteQuestion = (questionId: string) => apiRequest<void>(`/questions/${questionId}`, { method: "DELETE" });

export const createQuestionOption = (questionId: string, payload: OptionPayload) => apiRequest<QuizOption>(`/questions/${questionId}/options`, {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateQuestionOption = (optionId: string, payload: Partial<Omit<OptionPayload, "questionId">>) => apiRequest<QuizOption>(`/questions/options/${optionId}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteQuestionOption = (optionId: string) => apiRequest<void>(`/questions/options/${optionId}`, { method: "DELETE" });
