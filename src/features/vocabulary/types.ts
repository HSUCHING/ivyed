export type VocabularyGoal = "cet4" | "cet6" | "postgraduate" | "ielts" | "toefl" | "business" | "daily" | "reading" | "course" | "custom";
export type VocabularyLevel = "starter" | "basic" | "intermediate" | "advanced";
export type LearningPreference = "memory" | "spelling" | "listening" | "example" | "exam" | "reading" | "speaking" | "business";
export type ScenarioType = "exam" | "business" | "daily" | "academic" | "reading" | "course" | "travel" | "custom";
export type SourceType = "official_book" | "exam_book" | "custom_book" | "content_words" | "course_words" | "note_words" | "ai_generated" | "imported";
export type LearningItemType = "word" | "phrase" | "sentence_pattern" | "grammar_point" | "listening_clip" | "reading_word" | "writing_expression" | "speaking_sentence" | "mistake";
export type WordStatus = "new" | "learning" | "familiar" | "weak" | "wrong" | "reviewing" | "mastered";
export type DailyTaskStatus = "pending" | "learning" | "practicing" | "reviewing" | "testing" | "completed";
export type QuestionType = "select_meaning" | "select_word" | "listening" | "spelling" | "cloze" | "matching" | "true_false";
export type ErrorType = "unknown" | "meaning_confusion" | "spelling_error" | "listening_error" | "context_error" | "reverse_recall_failed";
export type ReportPeriod = "daily" | "weekly" | "overall";
export type StudyPlanStatus = "active" | "paused" | "completed";
export type WordBookCategory = "official" | "exam" | "custom" | "content" | "ai";

export interface VocabularyProfile {
  userId: string;
  goal: VocabularyGoal;
  level: VocabularyLevel;
  planDurationDays: 30 | 60 | 90;
  dailyStudyMinutes: 10 | 20 | 30;
  dailyNewWords: number;
  dailyReviewLimit: number;
  preferences: LearningPreference[];
  currentScenarioId: string;
  currentBookId: string;
  currentPlanId: string;
  initialized: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description: string;
  targetGoals: VocabularyGoal[];
  recommendedSourceTypes: SourceType[];
  tags: string[];
}

export interface MaterialSource {
  id: string;
  type: SourceType;
  name: string;
  description: string;
  sourceRefId?: string;
  createdBy: "system" | "user" | "ai";
  createdAt: string;
}

export interface LearningItem {
  id: string;
  itemType: LearningItemType;
  text: string;
  phonetic?: string;
  audioUrl?: string;
  meaningCn?: string;
  meaningEn?: string;
  example?: string;
  exampleTranslation?: string;
  scenarioTags: string[];
  sourceId: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  metadata: {
    root?: string;
    affix?: string;
    synonyms?: string[];
    antonyms?: string[];
    collocations?: string[];
    aiMemoryHint?: string;
  };
  // Compatibility with the previous Word-first MVP.
  type?: "word";
  title?: string;
  word?: string;
}

export interface Word extends LearningItem {
  itemType: "word";
  type: "word";
  title: string;
  word: string;
  phonetic: string;
  meaningCn: string;
  meaningEn: string;
  example: string;
  exampleTranslation: string;
}

export interface WordBook {
  id: string;
  name: string;
  description: string;
  category: WordBookCategory;
  scenarioId: string;
  sourceId: string;
  totalItems: number;
  itemIds: string[];
  difficulty: "easy" | "medium" | "hard";
  createdBy: "system" | "user" | "ai";
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  goal: VocabularyGoal;
  scenarioId: string;
  bookId: string;
  level: VocabularyLevel;
  planDurationDays: number;
  dailyStudyMinutes: number;
  practicePreference: LearningPreference;
  dailyNewItems: number;
  dailyReviewLimit: number;
  testCycle: "weekly" | "per_100_items" | "book_unit";
  estimatedFinishDate: string;
  status: StudyPlanStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLearningItemState {
  userId: string;
  itemId: string;
  bookId: string;
  status: WordStatus;
  masteryScore: number;
  correctCount: number;
  wrongCount: number;
  continuousCorrectCount: number;
  continuousWrongCount: number;
  lastStudiedAt?: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  currentIntervalDays: number;
  easeFactor: number;
  errorTypes: ErrorType[];
  updatedAt: string;
  // Compatibility with the previous Word-first MVP.
  wordId: string;
}

export interface DailyVocabularyTask {
  taskId: string;
  userId: string;
  date: string;
  planId: string;
  scenarioId: string;
  bookId: string;
  newItemIds: string[];
  reviewItemIds: string[];
  wrongItemIds: string[];
  testRequired: boolean;
  estimatedMinutes: number;
  status: DailyTaskStatus;
  generatedReason: string[];
  createdAt: string;
  // Compatibility aliases.
  newWordIds: string[];
  reviewWordIds: string[];
  wrongWordIds: string[];
}

export interface PracticeQuestion {
  id: string;
  itemId: string;
  wordId: string;
  questionType: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface PracticeRecord {
  recordId: string;
  userId: string;
  sessionId: string;
  itemId: string;
  wordId: string;
  questionType: QuestionType;
  isCorrect: boolean;
  answer: string;
  correctAnswer: string;
  errorType?: ErrorType;
  responseTime: number;
  usedHint: boolean;
  createdAt: string;
}

export interface LearningFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  errorType?: ErrorType;
  explanation: string;
  scenarioExample?: string;
  nextAction: string;
}

export interface WrongItemRecord {
  id: string;
  userId: string;
  itemId: string;
  wordId: string;
  errorTypes: ErrorType[];
  wrongCount: number;
  lastWrongAt: string;
  masteryScore: number;
  nextReviewAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface LearningReport {
  id: string;
  userId: string;
  period: ReportPeriod;
  dateRange: { start: string; end: string };
  newItemsCount: number;
  reviewedItemsCount: number;
  masteredItemsCount: number;
  wrongItemsCount: number;
  accuracyRate: number;
  taskCompletionRate: number;
  studyDurationSeconds: number;
  weakQuestionTypes: QuestionType[];
  weakItems: string[];
  suggestion: string;
  studentName: string;
  streakDays: number;
  pointsEarned: number;
  totalPoints: number;
  levelName: string;
  badgeName: string;
  adjustmentAdvice: string;
  createdAt: string;
  // Compatibility aliases.
  date: string;
  newWordsCount: number;
  reviewWordsCount: number;
  wrongWordsCount: number;
  masteredWordsCount: number;
}

export interface StageTestResult {
  score: number;
  accuracyRate: number;
  masteryRate: number;
  weakItems: string[];
  weakQuestionTypes: QuestionType[];
  suggestion: string;
  adjustmentAdvice: string;
}

export type UserWordState = UserLearningItemState;
export type DailyTask = DailyVocabularyTask;
export type WrongWordRecord = WrongItemRecord;
