export type AIProviderName = "mock" | "openai" | "anthropic" | "deepseek";

export interface AIModelConfig {
  provider: AIProviderName;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface SpeechTokenScore {
  token: string;
  score: number;
  status: "great" | "warn" | "error";
}

export interface SpeechEvaluationRequest {
  taskId: string;
  transcript: string;
  audioUrl?: string;
}

export interface SpeechEvaluationResult {
  score: number;
  dimensions: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };
  tokens: SpeechTokenScore[];
  feedback: string;
}

export interface AIProvider {
  evaluateSpeech(input: SpeechEvaluationRequest): Promise<SpeechEvaluationResult>;
}
