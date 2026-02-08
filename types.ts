export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  videoUrl: string;
  topic: string;
  channelName?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  videoUrl: string;
  topic: string;
  channelName?: string;
  questions?: QuizQuestion[];
  userAnswers?: number[];
  score: number; // percentage
  issuedAt: string;
}

export enum AppState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  VERIFY = 'VERIFY'
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;
}