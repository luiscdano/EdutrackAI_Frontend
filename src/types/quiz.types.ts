export interface QuizSubject {
  id: string;
  name: string;
  level: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimitMinutes: number;
  isActive: boolean;
  createAt: string;
  subject: QuizSubject;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    quizziesAttempts: number;
    question: number;
  };
}

export interface QuizOption {
  id: string;
  optionText: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  topic: string;
  difficulty: string;
  selectedOptionId?: string | null;
  questionOptions: QuizOption[];
  quizzies?: {
    id: string;
    title: string;
  };
}

export interface QuizAttemptSummary {
  id: string;
  score: number | string;
  totalQuestion: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt: string | null;
  isFinished: boolean;
  resumed?: boolean;
  quizzies: {
    id: string;
    title: string;
    description?: string;
    difficulty?: string;
    timeLimitMinutes: number;
    subject?: QuizSubject;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    studenAnswers: number;
  };
}

export interface QuizAttemptDetail extends QuizAttemptSummary {
  expiresAt: string;
  isExpired: boolean;
  questions: QuizQuestion[];
}

export interface QuizPayload {
  subjectId: string;
  title: string;
  description: string;
  difficulty: string;
  timeLimitMinutes: number;
  isActive?: boolean;
}

export interface QuestionPayload {
  quizId: string;
  questionText: string;
  questionType: string;
  points: number;
  topic: string;
  difficulty: string;
}

export interface OptionPayload {
  questionId: string;
  optionText: string;
  isCorrect: boolean;
}
