import { createAIProvider } from "./providers";
import type { AIProviderName, SpeechEvaluationRequest } from "./types";

export async function evaluateSpeech(input: SpeechEvaluationRequest) {
  const provider = createAIProvider({
    provider: (process.env.AI_PROVIDER as AIProviderName | undefined) ?? "mock",
    model: process.env.AI_MODEL ?? "mock-speech-evaluator-v1",
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL
  });

  return provider.evaluateSpeech(input);
}
